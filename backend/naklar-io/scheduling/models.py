from dataclasses import dataclass
from datetime import timedelta, datetime
import logging

from django.conf import settings as dj_settings
from django.db import models
from django.db.models import Q
from django.utils import timezone
from post_office import mail
from simple_history.models import HistoricalRecords

from scheduling import validators, util

logger = logging.getLogger(__name__)


class TimeSlot(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField(validators=[validators.validate_duration])

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
            appointments = [
                a for a in self.appointment_set.all()
                if a.start_time >= base_time and a.end_time < week_end and not a.rejected
            ]
            for appointment in appointments:
                if appointment.start_time > current_time:
                    slots.append(AvailableSlot(self, current_time, appointment.start_time - current_time))
                current_time = appointment.end_time
            if (current_time - base_time) < self.duration:
                slots.append(AvailableSlot(self, current_time, self.duration - (current_time - base_time)))
        return slots


class ActiveAppointmentManager(models.Manager):
    """
    Only returns appointments which haven't been rejected
    """

    def get_queryset(self):
        return super(ActiveAppointmentManager, self).get_queryset().exclude(
            Q(status=Appointment.Status.OWNER_REJECTED) |
            Q(status=Appointment.Status.INVITEE_REJECTED)
        ).all()


class Appointment(models.Model):
    owner = models.ForeignKey(to=dj_settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    timeslot = models.ForeignKey(to=TimeSlot, on_delete=models.CASCADE)
    start_time = models.DateTimeField(validators=[validators.validate_start_time])
    duration = models.DurationField(validators=[validators.validate_duration])

    subject = models.ForeignKey(to='account.Subject', on_delete=models.SET_NULL, null=True, blank=True)

    topic = models.CharField(max_length=255, blank=True)

    meeting = models.ForeignKey(to='roulette.Meeting', on_delete=models.SET_NULL, null=True, blank=True)

    confirmation_request_time = models.DateTimeField(auto_now_add=True)
    invitee_rejects = models.ManyToManyField(
        to=dj_settings.AUTH_USER_MODEL, related_name='rejected_appointments', blank=True
    )

    all_objects = models.Manager()
    objects = ActiveAppointmentManager()

    class Status(models.TextChoices):
        REQUESTED = 'REQUESTED'
        CONFIRMED = 'CONFIRMED'

        # rejection states
        OWNER_REJECTED = 'OWNER_REJECTED'
        INVITEE_REJECTED = 'INVITEE_REJECTED'

        # meeting states
        OWNER_STARTED = 'OWNER_STARTED'
        INVITEE_STARTED = 'INVITEE_STARTED'
        BOTH_STARTED = 'BOTH_STARTED'

    status = models.TextField(choices=Status.choices, default=Status.REQUESTED)

    history = HistoricalRecords()

    @classmethod
    def book_available(cls, slot: 'AvailableSlot', duration, **kwargs):
        return cls.objects.create(timeslot=slot.parent, start_time=slot.start_time, duration=duration, **kwargs)

    def save(self, *args, **kwargs):
        # to check: is constraint satisfied?
        super(Appointment, self).save(*args, **kwargs)

    @property
    def end_time(self):
        return self.start_time + self.duration

    @property
    def invitee(self):
        return self.timeslot.owner

    @property
    def rejected(self) -> bool:
        return self.status == Appointment.Status.INVITEE_REJECTED or self.status == Appointment.Status.OWNER_REJECTED

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

    def send_confirmed(self):
        logger.debug(f'sending confirmation to owner: {self.owner.email}')
        mail.send([self.owner.email], 'noreply@naklar.io', 'appointment_confirmed', context={
            'appointment': self,
            'confirming_party': self.invitee,
            'other_party': self.owner
        })
        self.confirmation_request_time = timezone.now()
        self.save()

    def send_confirmation_request(self):
        logger.debug(f'sending confirmation request to invitee {self.invitee.email}')
        mail.send([self.invitee.email], 'noreply@naklar.io', 'appointment_request', context={
            'appointment': self
        })

    def handle_rejection(self, rejecting_party):
        """Handle rejection of appointment from either party
        If the ::rejecting_party is the owner, don't search for another possible timeslot
        Otherwise try to match a new party!
        """
        if rejecting_party == self.owner:
            logger.debug("Sending rejection notification to timeslot owner and updating appointment")
            mail.send([self.invitee.email], 'noreply@naklar.io', template='appointment_rejected', context={
                'appointment': self,
                'rejecting_party': self.owner,
                'other_party': self.invitee,
                'new_try': False
            })
            self.status = Appointment.Status.OWNER_REJECTED
        elif rejecting_party == self.invitee:
            self.invitee_rejects.add(self.invitee)
            old_status = self.status
            new_slot = util.find_matching_timeslot(self.start_time, self.duration, self.subject, self.owner,
                                                   TimeSlot.objects.exclude(owner__in=self.invitee_rejects.all()))
            if new_slot:
                self.timeslot = new_slot
                self.status = Appointment.Status.REQUESTED
                self.save()
                self.send_confirmation_request()
            else:
                logger.debug("Send rejection notification to owner and updating appointment")
                self.status = Appointment.Status.INVITEE_REJECTED
            if old_status == Appointment.Status.CONFIRMED:
                mail.send([self.owner.email], 'noreply@naklar.io', template='appointment_rejected', context={
                    'appointment': self,
                    'rejecting_party': self.invitee,
                    'other_party': self.owner,
                    'new_try': self.status == Appointment.Status.REQUESTED
                })
            else:
                mail.send([self.owner.email], 'noreply@naklar.io', template='appointment_failed', context={
                    'appointment': self,
                    'other_party': self.owner,
                })
        self.save()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['timeslot', 'start_time'],
                name='unique_appointment_timeslot_start_time',
                condition=~Q(Q(status='OWNER_REJECTED') | Q(status='INVITEE_REJECTED'))
            ),
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
