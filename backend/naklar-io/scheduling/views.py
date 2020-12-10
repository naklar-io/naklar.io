from django.db.models import Q, Prefetch
from django.db.models.functions import Now
from rest_framework import viewsets, mixins, permissions
# Create your views here.
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.reverse import reverse

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


class AvailableSlotViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = TimeSlot.objects.prefetch_related(Prefetch('appointment_set', queryset=Appointment.objects.filter(
        start_time__gte=Now()))).filter(Q(weekly=True) | Q(start_time__gte=Now()))
    serializer_class = AvailableSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        slots = []
        for timeslot in queryset:
            slots.extend(timeslot.available_slots())

        page = self.paginate_queryset(slots)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('owner').all()
    serializer_class = FullAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[IsSlotOwner])
    def accept(self, request, pk=None):
        pass

    @action(detail=True, methods=['post'], permission_classes=[IsSlotOwner, IsOwnerOrReadOnly])
    def reject(self, request, pk=None):
        pass

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
