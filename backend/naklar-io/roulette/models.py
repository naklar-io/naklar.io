from django.db import models
from django.db.models.signals import pre_delete
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from account.models import StudentData, TutorData, Subject

import uuid
import requests
import hashlib
import xml.etree.ElementTree as ET
from urllib.parse import urlencode



class Request(models.Model):
    """superclass for request of a Meeting, either on Student or on Teacher side

    A User can only have one open request at a time. Also adding a created field, that makes it possible to prune old requests
    We also keep track of a list of failed_matches that should make sure the same Match isn't tried more than once
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Setting related_name to '+' --> no reverse relation from User necessary (for now)
    failed_matches = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='+')

    class Meta:
        abstract = True


class StudentRequest(Request):
    """student request always additionally includes a Subject representing the subject he/she needs help with"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)



class TutorRequest(Request):
    """tutorrequest can store additional data"""
    pass


class Match(models.Model):
    """Represents a Match between two requests StudentRequest, TutorRequest

    If two matching requests StudentRequest <-> TutorRequest are found, a Match is created. Both sides have to agree to complete the Match
    Only one Match can be assigned to a request at any time. (OneToOneField)
    If the match is not successfull, the corresponding user is added to both failed_matches lists
    We keep track of the created_time and the changed_time to be able to set upper reaction time-limits on matches
    """
    student_request = models.OneToOneField(StudentRequest, on_delete=models.CASCADE)
    tutor_request = models.OneToOneField(TutorRequest, on_delete=models.CASCADE)

    student_agree = models.BooleanField(default=False)
    tutor_agree = models.BooleanField(default=False)

    created_time = models.DateTimeField(auto_now_add=True)
    changed_time = models.DateTimeField(auto_now=True)


class Meeting(models.Model):
    """
    Meeting model represents a Meeting in BigBlueButton, using the available functions result in API calls
    """
    meeting_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(_("Meeting-Name"), max_length=254)

    users = models.ManyToManyField(settings.AUTH_USER_MODEL)

    attendee_pw = models.CharField(max_length=120, null=True)
    moderator_pw = models.CharField(max_length=120, null=True)

    established = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    time_established = models.DateTimeField(_("Aufgebaut"), null=True, blank=True)


    def build_api_request(self, call, parameters):
        to_hash = call + urlencode(parameters) + settings.BBB_SHARED
        h = hashlib.sha1(to_hash.encode('utf-8'))
        parameters['checksum'] = h.hexdigest()
        url = "{}/bigbluebutton/api/{}".format(settings.BBB_URL, settings.BBB_SHARED)
        request = url + "{}?{}".format(call, urlencode(parameters))
        return request

    def create_meeting(self):
        parameters = {'name': 'naklar.io',
                      'meetingID': str(self.meeting_id),
                      'meta_endCallBackUrl': settings.HOST + "/roulette/end_callback?meetingID="+str(self.session_id),
                      'logoutURL': 'https://naklar.io/landingpage/mockup_end/',
                      'welcome': 'Herzlich willkommen bei naklar.io!'}
        r = requests.get(build_api_request("create", parameters))
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
        r = requests.get(build_api_request("end", parameters))
        if delete_instance:
            self.delete()


    def create_join_link(self, user, moderator=False):
        if self.established:
            parameters = {'fullName': user.first_name + user.last_name,
                          'userID': str(user.uuid),
                          'redirect': 'false', #TODO: Play around with this one, to maybe make a request in AJAX possible
                          'meetingID': str(self.meeting_id),
                          'password': self.moderator_pw if moderator else self.attendee_pw
                         }
            self.users.add(user)
            return build_api_request("join", parameters)
        return None

    def get_meeting_info(self):
        # TODO: Make this API call return an object that makes sense
        call = "getMeetingInfo"
        parameters = {
            'meetingID': str(self.meeting_id)
        }
        return requests.get(build_api_request("join", parameters)).content


def meeting_deleted(sender, instance, using, **kwargs):
    instance.end_meeting(delete_instance=False)

pre_delete.connect(meeting_deleted, Meeting)
