from django.db.models import Q
from django.db.models.functions import Now
from rest_framework import viewsets, mixins, permissions
# Create your views here.
from rest_framework.response import Response
from rest_framework.reverse import reverse

from scheduling.models import TimeSlot, Appointment
from scheduling.serializers import AvailableSlotSerializer, AppointmentSerializer, TimeSlotSerializer


class IsOwnerOrSlotOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owner or timeslot owner to alter an appointment
    """
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or obj.timeslot.owner == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class AvailableSlotViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = TimeSlot.objects.filter(Q(weekly=True) | Q(start_time__gte=Now())).distinct()
    serializer_class = AvailableSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        slots = []
        for timeslot in queryset:
            slots.extend(timeslot.available_slots)

        page = self.paginate_queryset(slots)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSlotOwner]


class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]