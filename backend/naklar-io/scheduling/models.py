from dataclasses import dataclass
from datetime import timedelta, datetime

from django.db import models
from django.conf import settings as dj_settings
from django.db.models import Q, F
from django.utils import timezone

from scheduling import validators


class TimeSlot(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField()

    weekly = models.BooleanField(default=True)

    @property
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

        week_end = start_time + timedelta(weeks=1)
        weeks = weeks if self.weekly else 1
        for i in range(0, weeks):
            base_time = start_time + timedelta(weeks=i)
            current_time = base_time
            for request in self.scheduledrequest_set.filter(
                    start_time__gte=current_time, start_time__lt=week_end
            ).order_by('start_time'):
                if request.start_time > current_time:
                    slots.append(AvailableSlot(self, current_time, request.start_time - current_time))
                current_time = request.end_time
            if (current_time - base_time) < self.duration:
                slots.append(AvailableSlot(self, current_time, self.duration - (current_time - base_time)))
        return slots


class ScheduledRequest(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    timeslot = models.ForeignKey(to=TimeSlot, on_delete=models.CASCADE)
    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField(validators=[validators.validate_duration])

    subject = models.ForeignKey(to='account.Subject', on_delete=models.SET_NULL, null=True, blank=True)

    topic = models.CharField(max_length=255, blank=True)

    @classmethod
    def book_available(cls, slot: 'AvailableSlot', **kwargs):
        return cls.objects.create(timeslot=slot.parent, start_time=slot.start_time, duration=slot.duration, **kwargs)

    def save(self, *args, **kwargs):
        # to check: is constraint satisfied?
        super(ScheduledRequest, self).save(*args, **kwargs)

    @property
    def end_time(self):
        return self.start_time + self.duration

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['timeslot', 'start_time'], name='unique_request_timeslot_start_time'),
            models.CheckConstraint(check=Q(start_time__time__gte=F('timeslot__start_time__start_time__time')),
                                   name='request_start_time_gte_timeslot')
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
