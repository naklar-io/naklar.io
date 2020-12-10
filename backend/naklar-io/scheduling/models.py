import math
from dataclasses import dataclass
from datetime import timedelta, datetime
from typing import Optional

from django.db import models
from django.conf import settings as dj_settings
from django.db.models import QuerySet
from django.utils import timezone

from scheduling import validators, util


class TimeSlot(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField()

    weekly = models.BooleanField(default=True)

    def available_slots(self, weeks=4) -> list['AvailableSlot']:
        now = timezone.now()
        start_time = self.start_time
        slots = []
        # if it's terminated weekly, we have to calculate our new start time
        if start_time < now:
            if self.weekly:
                while start_time < now:
                    start_time += timedelta(weeks=1)
            else:
                return []

        weeks = weeks if self.weekly else 1
        for i in range(0, weeks):
            base_time = start_time + timedelta(weeks=i)
            week_end = base_time + timedelta(weeks=1)
            current_time = base_time
            for request in self.appointment_set.all():
                if request.start_time >= base_time and request.end_time < week_end:
                    if request.start_time > current_time:
                        slots.append(AvailableSlot(self, current_time, request.start_time - current_time))
                    current_time = request.end_time
            if (current_time - base_time) < self.duration:
                slots.append(AvailableSlot(self, current_time, self.duration - (current_time - base_time)))
        return slots

    def save(self, *args, **kwargs):
        if self.pk:
            # filter through all appointments and cancel if no longer in range
            appointments = self.appointment_set.filter(start_time__gte=timezone.now())
            for appointment in appointments:
                if not appointment.check_in_range():
                    appointment.delete()

        super(TimeSlot, self).save(*args, **kwargs)


class Appointment(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    timeslot = models.ForeignKey(to=TimeSlot, on_delete=models.CASCADE)
    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField(validators=[validators.validate_duration])

    subject = models.ForeignKey(to='account.Subject', on_delete=models.SET_NULL, null=True, blank=True)

    topic = models.CharField(max_length=255, blank=True)

    @classmethod
    def book_available(cls, slot: 'AvailableSlot', duration, **kwargs):
        return cls.objects.create(timeslot=slot.parent, start_time=slot.start_time, duration=duration, **kwargs)

    def save(self, *args, **kwargs):
        # to check: is constraint satisfied?
        super(Appointment, self).save(*args, **kwargs)

    @property
    def end_time(self):
        return self.start_time + self.duration

    def check_in_range(self) -> bool:
        now = timezone.now()
        # only check if our start time actually is in the future!
        if self.start_time >= now:
            return util.check_slot_in_range(self.start_time, self.duration, self.timeslot)
        else:
            return True

    def check_collisions(self) -> list['Appointment']:
        collisions = []
        my_start = self.start_time
        my_end = self.end_time
        for appointment in self.objects.exclude(pk=self.pk):
            if my_start == appointment.start_time or my_end >= appointment.end_time:
                collisions.append(appointment)

        return collisions

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['timeslot', 'start_time'], name='unique_appointment_timeslot_start_time'),
        ]


@dataclass
class AvailableSlot:
    parent: TimeSlot
    start_time: datetime
    duration: timedelta

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return f"Slot<{self.start_time.strftime('%d.%m.%y %H:%M')} - {(self.start_time + self.duration).strftime('%d.%m.%y %H:%M')}>"
