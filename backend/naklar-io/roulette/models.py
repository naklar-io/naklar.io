from django.db import models
from django.db.models.signals import pre_delete, pre_save, post_save, post_delete
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.dispatch import receiver

from django.conf import settings

from account.models import StudentData, TutorData, Subject

import datetime
import random
import uuid
import requests
import hashlib
import xml.etree.ElementTree as ET
from urllib.parse import urlencode


class Feedback(models.Model):
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 on_delete=models.CASCADE, to_field='uuid', related_name='received_feedback')
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid', related_name='provided_feedback')

    message = models.TextField(_("Nachricht"), blank=True)
    rating = models.PositiveSmallIntegerField(_("Bewertung"), validators=[
        MinValueValidator(0), MaxValueValidator(5)])
    created = models.DateTimeField(auto_now_add=True)


class Request(models.Model):
    """superclass for request of a Meeting, either on Student or on Teacher side

    A User can only have one open request at a time. Also adding a created field, that makes it possible to prune old requests
    We also keep track of a list of failed_matches that should make sure the same Match isn't tried more than once
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, to_field='uuid')

    # Setting related_name to '+' --> no reverse relation from User necessary (for now)
    failed_matches = models.ManyToManyField(settings.AUTH_USER_MODEL,
                                            related_name='+', blank=True)

    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class StudentRequest(Request):
    """student request always additionally includes a Subject representing the subject he/she needs help with"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)


class TutorRequest(Request):
    """tutorrequest can store additional data"""
    pass


@receiver(post_save, sender=TutorRequest)
@receiver(post_save, sender=StudentRequest)
def look_for_match(sender, instance, **kwargs):
    if sender is StudentRequest:
        # look for open tutor requests and match the best one
        tutor_requests = TutorRequest.objects.exclude(
            user__in=instance.failed_matches.all())
        tutor_requests = tutor_requests.filter(match__isnull=True)
        best_tutor = max(tutor_requests, key=lambda k: calculate_matching_score(instance, k))
        if best_tutor:
            Match.objects.create(
                student_request=instance,
                tutor_request=best_tutor
            )
    else:
        student_requests = StudentRequest.objects.exclude(
            user__in=instance.failed_matches.all())
        student_requests = student_requests.filter(match__isnull=True)
        best_student = max(student_requests, key=lambda k: calculate_matching_score(k, instance))
        if best_student:
            Match.objects.create(
                student_request=best_student,
                tutor_request=instance
            )

def calculate_matching_score(student_request: StudentRequest, tutor_request: TutorRequest):
    score = 1
    if tutor_request.user.tutordata.subjects.filter(pk=student_request.subject.id).exists():
        score += 5
    return score


class Match(models.Model):
    """Represents a Match between two requests StudentRequest, TutorRequest

    If two matching requests StudentRequest <-> TutorRequest are found, a Match is created. Both sides have to agree to complete the Match
    Only one Match can be assigned to a request at any time. (OneToOneField)
    If the match is not successfull, the corresponding user is added to both failed_matches lists
    We keep track of the created_time and the changed_time to be able to set upper reaction time-limits on matches
    """
    student_request = models.OneToOneField(
        StudentRequest, on_delete=models.CASCADE)
    tutor_request = models.OneToOneField(
        TutorRequest, on_delete=models.CASCADE)

    student_agree = models.BooleanField(default=False)
    tutor_agree = models.BooleanField(default=False)

    created_time = models.DateTimeField(auto_now_add=True)
    changed_time = models.DateTimeField(auto_now=True)

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)


@receiver(post_save, sender=Match)
def on_match_change(sender, instance, created, **kwargs):
    if created:
        # send update to requests
        pass
    else:
        if instance.student_agree and instance.tutor_agree:
            meeting = Meeting(match=instance, name="naklar.io - Meeting")
            #meeting.users.add(instance.student_request.user
                             # )
            meeting.save()
            meeting.users.add(instance.student_request.user, instance.tutor_request.user)
            meeting.save()
            meeting.create_meeting()
            # send update with meeting to requests


@receiver(pre_delete, sender=Match)
def on_match_delete(sender, instance: Match, **kwargs):
    if instance.student_agree and instance.tutor_agree:
        # TODO: do nothing? request feedback?
        pass
    else:
        # add to both requests failed matches and save --> should re-start matching
        tutor = instance.tutor_request.user
        student = instance.student_request.user
        instance.student_request.failed_matches.add(tutor)
        instance.tutor_request.failed_matches.add(student)
        instance.student_request.save()
        instance.tutor_request.save()


class Meeting(models.Model):
    """
    Meeting model represents a Meeting in BigBlueButton, using the available functions result in API calls
    """
    meeting_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    match = models.OneToOneField(Match, to_field='uuid',
                                 on_delete=models.CASCADE, null=True)

    name = models.CharField(_("Meeting-Name"), max_length=254)

    users = models.ManyToManyField(settings.AUTH_USER_MODEL)

    attendee_pw = models.CharField(max_length=120, null=True)
    moderator_pw = models.CharField(max_length=120, null=True)

    established = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    time_established = models.DateTimeField(
        _("Aufgebaut"), null=True, blank=True)

    def build_api_request(self, call, parameters):
        to_hash = call + urlencode(parameters) + settings.BBB_SHARED
        h = hashlib.sha1(to_hash.encode('utf-8'))
        parameters['checksum'] = h.hexdigest()
        url = "{}/bigbluebutton/api/".format(
            settings.BBB_URL)
        request = url + "{}?{}".format(call, urlencode(parameters))
        return request

    def create_meeting(self):
        parameters = {'name': 'naklar.io',
                      'meetingID': str(self.meeting_id),
                      'meta_endCallBackUrl': settings.HOST + "/roulette/end_callback?meetingID="+str(self.meeting_id),
                      'logoutURL': 'https://naklar.io/landingpage/mockup_end/',
                      'welcome': 'Herzlich willkommen bei naklar.io!'}
        r = requests.get(self.build_api_request("create", parameters))
        root = ET.fromstring(r.content)
        if r.status_code == 200:
            self.attendee_pw = root.find("attendeePW").text
            self.moderator_pw = root.find("moderatorPW").text
            self.established = True
#        self._add_webhook()
        self.save()

    def _add_webhook(self):
        # TODO: Add ability to receive data from this webhook
        call = 'hooks/create'
        parameters = {
            'callbackURL': settings.HOST + '/roulette/webhook_callback',
            'meetingID': str(self.meeting_id),
        }
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + '/bigbluebutton/api/' + \
            call + '?' + urlencode(parameters)
        print(full_link)
        r = requests.get(full_link)
        print(r.content)

    def end_meeting(self, delete_instance=True, close_session=True):
        parameters = {'meetingID': str(self.meeting_id),
                      'password': self.moderator_pw}
        r = requests.get(self.build_api_request("end", parameters))
        if delete_instance:
            self.delete()

    def create_join_link(self, user, moderator=False):
        # TODO: Fix check?
        if user in self.users.all() and self.established:
            parameters = {'fullName': user.first_name + user.last_name,
                          'userID': str(user.uuid),
                          # TODO: Play around with this one, to maybe make a request in AJAX possible
                          'redirect': 'true',
                          'meetingID': str(self.meeting_id),
                          'password': self.moderator_pw if moderator else self.attendee_pw
                          }
            return self.build_api_request("join", parameters)
        return None

    def get_meeting_info(self):
        # TODO: Make this API call return an object that makes sense
        call = "getMeetingInfo"
        parameters = {
            'meetingID': str(self.meeting_id)
        }
        return requests.get(build_api_request("join", parameters)).content


@receiver(pre_delete, sender=Meeting)
def meeting_deleted(sender, instance, using, **kwargs):
    instance.end_meeting(delete_instance=False)

@receiver(post_delete, sender=Meeting)
def delete_match(sender, instance, **kwargs):
    try:
        instance.match.delete()
    except Match.DoesNotExist:
        pass