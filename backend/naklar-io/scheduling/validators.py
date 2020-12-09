from datetime import datetime, timedelta
from typing import TYPE_CHECKING, OrderedDict

from django.db.models import QuerySet
from django.utils import timezone

from scheduling import util

if TYPE_CHECKING:
    from models import TimeSlot
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers


def validate_duration(value: timedelta):
    if value.total_seconds() == 0:
        raise ValidationError(_("Duration can't be 0!"))
    if value.seconds % (15 * 60) != 0:
        raise ValidationError(_('Duration needs to be a multiple of 15 minutes!'))


def validate_start_time(value: datetime):
    if value.minute % 15 != 0 or value.second > 0 and value.microsecond > 0:
        raise ValidationError(_('Start time needs to be at a multiple of 15 minutes!'))
    if value <= timezone.now():
        raise ValidationError(_('Start time needs to be in the future!'))


class AppointmentValidator:
    requires_context = True

    def __init__(self, queryset: QuerySet):
        self.queryset = queryset

    def __call__(self, data: OrderedDict, serializer):
        timeslot: 'TimeSlot' = data["timeslot"]
        start_time: datetime = data["start_time"]
        duration: timedelta = data["duration"]
        end_time = start_time + duration
        queryset = self.queryset
        if serializer.instance:
            queryset = queryset.exclude(id=serializer.instance.id)
        queryset = queryset.filter(timeslot=timeslot, start_time__date=start_time.date())

        if not util.check_slot_in_range(start_time, duration, timeslot):
            raise serializers.ValidationError(_("This appointment doesn't match the timeslots range!"))

        for appointment in queryset:
            if start_time < appointment.end_time and end_time > appointment.start_time:
                raise serializers.ValidationError(_("This appointment overlaps with at least one other appointment!"))

