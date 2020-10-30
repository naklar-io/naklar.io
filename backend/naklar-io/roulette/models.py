import hashlib
import time
import uuid
import xml.etree.ElementTree as ET
from datetime import timedelta
from urllib.parse import urlencode

import requests
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import UniqueConstraint, Q
from django.db.models.signals import (post_delete, post_save, pre_save)
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from account.models import CustomUser, StudentData, Subject, TutorData

channel_layer = get_channel_layer()


class MatchRejectReasons:
    # keep track of why matches fail
    TUTOR_REJECT = 'TR'
    TUTOR_TIMEOUT = 'TT'
    STUDENT_REJECT = 'SR'
    STUDENT_TIMEOUT = 'ST'
    BOTH_TIMEOUT = 'BT'
    OTHER_REASON = 'OR'
    FAIL_REASONS = [
        (TUTOR_REJECT, 'Tutor reject'),
        (TUTOR_TIMEOUT, 'Tutor timeout'),
        (STUDENT_REJECT, 'Student reject'),
        (STUDENT_TIMEOUT, 'Student timeout'),
        (BOTH_TIMEOUT, 'Both timed out'),
        (OTHER_REASON, 'Other reason')
    ]


class Report(models.Model):
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 to_field='uuid', related_name='provided_reports')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 to_field='uuid', related_name='received_reports')

    message = models.TextField(_("Nachricht"))

    meeting = models.ForeignKey(
        'roulette.Meeting', on_delete=models.CASCADE, null=True)

    created = models.DateTimeField(
        verbose_name=_("Erstellt"), auto_now_add=True, editable=False)

    class Meta:
        verbose_name = "Meldung"
        verbose_name_plural = "Meldungen"


class Feedback(models.Model):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid', related_name='provided_feedback')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 on_delete=models.CASCADE, to_field='uuid', related_name='received_feedback')

    message = models.TextField(_("Nachricht"), blank=True)

    meeting = models.ForeignKey(
        'roulette.Meeting', on_delete=models.CASCADE, null=True)

    rating = models.PositiveSmallIntegerField(_("Bewertung"), validators=[
        MinValueValidator(0), MaxValueValidator(5)])
    created = models.DateTimeField(
        verbose_name=_("Erstellt"), auto_now_add=True)

    class Meta:
        unique_together = [['receiver', 'provider', 'meeting']]


class Request(models.Model):
    """superclass for request of a Meeting, either on Student or on Teacher side

    A User can only have one active request at a time. Also adding a created field, that makes it possible to prune old requests
    We also keep track of a list of failed_matches that should make sure the same Match isn't tried more than once
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    # Setting related_name to '+' --> no reverse relation from User necessary (for now)
    failed_matches = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                            related_name='+', blank=True)

    created = models.DateTimeField(auto_now_add=True)

    is_manual_deleted = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    deactivated = models.DateTimeField(null=True)

    last_poll = models.DateTimeField(default=timezone.now)
    # How many are connected?
    connected_count = models.PositiveIntegerField(default=0)

    notifications = GenericRelation('notify.Notification')

    meeting = models.OneToOneField(
        "roulette.Meeting", on_delete=models.SET_NULL, null=True, default=None, related_name='+')

    def _successful(self):
        if self.meeting:
            return self.meeting.duration >= timedelta(minutes=5)
        return False

    _successful.boolean = True
    successful = property(_successful)

    @property
    def duration(self):
        if self.deactivated is not None:
            return self.deactivated - self.created
        else:
            return timezone.now() - self.created

    def manual_delete(self):
        self.is_manual_deleted = True
        self.save()
        self.delete()

    def deactivate(self):
        if self.is_active:
            self.is_active = False
            self.deactivated = timezone.now()
            if isinstance(self, TutorRequest):
                Match.objects.filter(tutor_request__id=self.id).deactivate(MatchRejectReasons.TUTOR_REJECT)
            if isinstance(self, StudentRequest):
                Match.objects.filter(student_request__id=self.id).deactivate(MatchRejectReasons.STUDENT_REJECT)
            self.save()

    def get_match(self):
        match = self.match_set.filter(failed=False, successful=False)
        if match:
            return match.get()
        else:
            return None

    class Meta:
        abstract = True


class StudentRequest(Request):
    """student request always additionally includes a Subject representing the subject he/she needs help with"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)


class TutorRequest(Request):
    """tutorrequest can store additional data"""
    pass


class MatchQuerySet(models.QuerySet):
    def deactivate(self, reason: str):
        self.active().update(failed=True, fail_reason=reason)

    def active(self):
        return self.filter(failed=False, successful=False)


class MatchManager(models.Manager):
    def get_queryset(self):
        return MatchQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()


class Match(models.Model):
    """Represents a Match between two requests StudentRequest, TutorRequest, or Student and Tutor

    If two matching requests StudentRequest <-> TutorRequest are found, a Match is created. Both sides have to agree to complete the Match
    Only one Match can be assigned to a request at any time. (OneToOneField)
    If the match is not successfull, the corresponding user is added to both failed_matches lists
    We keep track of the created_time and the changed_time to be able to set upper reaction time-limits on matches
    """
    student_request = models.ForeignKey(
        StudentRequest, on_delete=models.CASCADE, null=True)
    tutor_request = models.ForeignKey(
        TutorRequest, on_delete=models.CASCADE, null=True)

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_match")
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tutor_match")

    student_agree = models.BooleanField(default=False)
    tutor_agree = models.BooleanField(default=False)

    created_time = models.DateTimeField(auto_now_add=True)
    changed_time = models.DateTimeField(auto_now=True)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    successful = models.BooleanField(default=False)
    failed = models.BooleanField(default=False)
    fail_reason = models.CharField(choices=MatchRejectReasons.FAIL_REASONS, max_length=2, default=MatchRejectReasons.OTHER_REASON)

    def deactivate(self, reason):
        self.failed = True
        self.fail_reason = reason
        self.save()

    objects = MatchManager()

    class Meta:
        constraints = [UniqueConstraint(fields=['student_request', 'tutor_request'], condition=Q(failed=False, successful=False),
                                        name='unique_active_match_per_request')]


@receiver(pre_save, sender=Match)
def on_match_change(sender, instance: Match, **kwargs):
    if instance.student_agree and instance.tutor_agree and not hasattr(instance, 'meeting'):
        # set successful to true
        instance.successful = True
        meeting = Meeting.objects.create(
            match=instance, name="naklar.io - Meeting")
        meeting.users.add(instance.student,
                          instance.tutor)
        meeting.tutor = instance.tutor
        meeting.student = instance.student

        # Add meeting to corresponding requests
        instance.tutor_request.meeting = meeting
        instance.student_request.meeting = meeting
        instance.tutor_request.save(update_fields=('meeting',))
        instance.student_request.save(update_fields=('meeting',))
        meeting.save()
        meeting.create_meeting()
        group_send = async_to_sync(channel_layer.group_send)
        msg = {
            "type": "roulette.meeting_ready",
            "meetingID": str(meeting.meeting_id)
        }
        group_send(f"request_tutor_{instance.tutor_request.id}", msg)
        group_send(f"request_student_{instance.student_request.id}", msg)


@receiver(post_save, sender=Match)
def on_match_saved(sender, instance, **kwargs):
    group_send = async_to_sync(channel_layer.group_send)
    print("got updated match", instance.__dict__)
    if not instance.failed:
        msg = {
            "type": "roulette.match_update",
            "match": instance.id
        }
        group_send(f"request_tutor_{instance.tutor_request.id}", msg)
        group_send(f"request_student_{instance.student_request.id}", msg)
    elif not instance.successful:
        msg = {
            "type": "roulette.match_delete",
            "match": instance.id,
            "reason": instance.fail_reason
        }
        group_send(f"request_tutor_{instance.tutor_request.id}", msg)
        group_send(f"request_student_{instance.student_request.id}", msg)


# @receiver(post_delete, sender=Match)
def on_match_delete(sender, instance: Match, **kwargs):
    if instance.student_agree and instance.tutor_agree:
        # TODO: do nothing? request feedback?
        pass
    else:
        # add to both requests failed matches and save --> should re-start matching
        if instance.tutor_request and not instance.tutor_request.is_manual_deleted:
            instance.tutor_request.failed_matches.add(instance.student)
            instance.tutor_request.save()
        if instance.student_request and not instance.student_request.is_manual_deleted:
            instance.student_request.failed_matches.add(instance.tutor)
            instance.student_request.save()
    print("match delete!", channel_layer)
    group_send = async_to_sync(channel_layer.group_send)
    msg = {
        "type": "roulette.match_delete",
        "match": instance.id
    }
    group_send(f"request_tutor_{instance.tutor_request.id}", msg)
    group_send(f"request_student_{instance.student_request.id}", msg)


class Meeting(models.Model):
    """
    Meeting model represents a Meeting in BigBlueButton, using the available functions result in API calls
    """
    meeting_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    match = models.OneToOneField(Match, to_field='uuid',
                                 on_delete=models.SET_NULL, null=True, blank=True)

    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='tutor_meetings', to_field='uuid')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='student_meetings',
        to_field='uuid')

    name = models.CharField(_("Meeting-Name"), max_length=254)

    users = models.ManyToManyField(settings.AUTH_USER_MODEL)

    attendee_pw = models.CharField(max_length=120, null=True)
    moderator_pw = models.CharField(max_length=120, null=True)

    established = models.BooleanField(default=False)
    is_establishing = models.BooleanField(default=False)
    time_established = models.DateTimeField(
        _("Aufgebaut"), null=True, blank=True)

    ended = models.BooleanField(default=False)
    time_ended = models.DateTimeField(_("Beendet"), null=True, blank=True)

    class Meta:
        ordering = ['-time_established']

    @property
    def duration(self):
        if self.time_established:
            if self.time_ended:
                return self.time_ended - self.time_established
            else:
                return timezone.now() - self.time_established
        else:
            return None

    def build_api_request(self, call, parameters):
        to_hash = call + urlencode(parameters) + settings.BBB_SHARED
        h = hashlib.sha1(to_hash.encode('utf-8'))
        new_parameters = parameters.copy()
        new_parameters['checksum'] = h.hexdigest()
        url = f"{settings.BBB_URL}/bigbluebutton/api/"
        request = url + f"{call}?{urlencode(new_parameters)}"
        return request

    def create_meeting(self):
        if not self.is_establishing:
            self.is_establishing = True
            self.save()
            parameters = {'name': 'naklar.io',
                          'meetingID': str(self.meeting_id),
                          'meta_endCallbackUrl': settings.API_HOST + "/roulette/meeting/end/" + str(
                              self.meeting_id) + "/",
                          'logoutURL': settings.HOST,
                          'welcome': 'Herzlich willkommen bei naklar.io!'}
            r = requests.get(self.build_api_request("create", parameters))
            root = ET.fromstring(r.content)
            if r.status_code == 200:
                self.attendee_pw = root.find("attendeePW").text
                self.moderator_pw = root.find("moderatorPW").text
                self.established = True
                self.is_establishing = False
                self.time_established = timezone.now()
            #        self._add_webhook()
            self.save()
        else:
            while self.is_establishing:
                time.sleep(0.05)
                self.refresh_from_db(fields=['is_establishing'])

    def end_meeting(self, close_session=True):
        if self.ended:
            return
        parameters = {'meetingID': str(self.meeting_id),
                      'password': self.moderator_pw}
        r = requests.get(self.build_api_request("end", parameters))
        self.ended = True
        self.time_ended = timezone.now()
        if self.match:
            try:
                match = self.match
                tutor_request = match.tutor_request
                match.student_request.deactivate()
                tutor_request.deactivate()
            except:
                # couldn't delete student_request. Most likely callback from bbb was already received.
                print('ignoring request deletion failure.')
        self.save()

    def create_join_link(self, user, moderator=False):
        if not self.established:
            self.create_meeting()
        if user in self.users.all() and self.established:
            parameters = {'fullName': user.first_name,
                          'userID': str(user.uuid),
                          # TODO: Play around with this one, to maybe make a request in AJAX possible
                          'redirect': 'true',
                          'meetingID': str(self.meeting_id),
                          'password': self.moderator_pw
                          }
            return self.build_api_request("join", parameters)
        return None
