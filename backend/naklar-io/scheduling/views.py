from datetime import datetime, timedelta

from django.db.models import Q, Prefetch, F
from django.db.models.functions import Now
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from rest_framework.serializers import Serializer

from account.permissions import HasAvailableAccessCodeOrReadOnly
from account.serializers import SubjectSerializer
from scheduling import filters, util
from scheduling.models import TimeSlot, Appointment
from scheduling.serializers import AvailableSlotSerializer, FullAppointmentSerializer, TimeSlotSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsSlotOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.timeslot.owner


class BelongsToAppointment(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.invitee or request.user == obj.owner


class AvailableSlotViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = TimeSlot.objects.prefetch_related(
        Prefetch('appointment_set', queryset=Appointment.objects.filter(start_time__gte=Now())),
    ).select_related(
        'owner',
        'owner__tutordata'
    ).prefetch_related(
        'owner__tutordata__subjects'
    ).filter(Q(weekly=True) | Q(start_time__gte=Now()), owner__tutordata__verified=True)
    serializer_class = AvailableSlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = filters.AvailableSlotFilter
    pagination_class = LimitOffsetPagination

    @action(['GET'], detail=False, serializer_class=SubjectSerializer, filterset_class=None)
    def subjects(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        subjects = set()
        for timeslot in qs:
            if len(timeslot.available_slots()) > 0:
                subjects = subjects.union(timeslot.owner.tutordata.subjects.all())
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        slots = []
        for timeslot in queryset:
            slots.extend(timeslot.available_slots())
        slots.sort(key=lambda x: x.start_time)

        page = self.paginate_queryset(slots)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('owner').filter(start_time__gte=Now() - F('duration'))
    serializer_class = FullAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly, HasAvailableAccessCodeOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[IsSlotOwner])
    def accept(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status == Appointment.Status.REQUESTED:
            appointment.status = Appointment.Status.CONFIRMED
            appointment.save()
            appointment.send_confirmed()
        return Response(data=self.get_serializer(instance=appointment).data)

    @action(detail=True, methods=['delete', 'post'], permission_classes=[BelongsToAppointment])
    def reject(self, request, pk=None):
        appointment = self.get_object()
        appointment.handle_rejection(self.request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[BelongsToAppointment],
            queryset=Appointment.objects.filter(start_time__lte=Now() + timedelta(minutes=15),
                                                start_time__gte=Now() - F('duration'), status__in=[
                    Appointment.Status.BOTH_STARTED,
                    Appointment.Status.INVITEE_STARTED,
                    Appointment.Status.OWNER_STARTED,
                    Appointment.Status.CONFIRMED]))
    def start_meeting(self, request, pk=None):
        from roulette.models import Meeting
        appointment = self.get_object()
        if appointment.meeting and not appointment.meeting.ended:
            meeting = appointment.meeting
        else:
            meeting = Meeting.objects.create(tutor=appointment.invitee, student=appointment.owner)
            meeting.users.add(appointment.owner, appointment.invitee)
            appointment.meeting = meeting
        if self.request.user == appointment.owner:
            appointment.status = Appointment.Status.BOTH_STARTED \
                if appointment.status == Appointment.Status.INVITEE_STARTED else Appointment.Status.OWNER_STARTED
        elif self.request.user == appointment.invitee:
            appointment.status = Appointment.Status.BOTH_STARTED \
                if appointment.status == Appointment.Status.OWNER_STARTED else Appointment.Status.INVITEE_STARTED
        appointment.save()
        meeting.create_meeting()
        url = meeting.create_join_link(self.request.user, True)
        return Response(data={'join_url': url, 'meeting_id': meeting.meeting_id})

    def perform_create(self, serializer: Serializer):
        if not serializer.validated_data['timeslot']:
            start_time: datetime = serializer.validated_data['start_time']
            duration = serializer.validated_data['duration']
            subject = serializer.validated_data['subject']
            timeslot = util.find_matching_timeslot(
                start_time, duration, subject, self.request.user, TimeSlot.objects.all()
            )
            if timeslot:
                serializer.initial_data['timeslot'] = timeslot.id
                serializer.run_validation(serializer.initial_data)
                serializer.validated_data['timeslot'] = timeslot
            else:
                raise ValidationError({
                    'timeslot': _("Couldn't find matching timeslot!")}
                )
        serializer.save()

    def get_queryset(self):
        queryset = super(AppointmentViewSet, self).get_queryset()
        return queryset.filter(Q(owner=self.request.user) | Q(timeslot__owner=self.request.user))


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.select_related('owner').all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super(TimeSlotViewSet, self).get_queryset()
        return queryset.filter(owner=self.request.user)
