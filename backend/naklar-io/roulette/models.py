from django.db import models
from django.db.models.signals import pre_delete
from account.models import TeacherAccount, StudentData, Subject
from naklario import settings
import uuid
import requests
import hashlib
import xml.etree.ElementTree as ET
from urllib.parse import urlencode



class Matches(models.Model):
    student = models.ForeignKey(StudentData, on_delete=models.CASCADE, null=True)
    teacher = models.ForeignKey(TeacherAccount, on_delete=models.CASCADE, null=True)
    teacher_yes = models.CharField(max_length=1, default='X')
    student_yes = models.CharField(max_length=1, default='X')
    
class Meeting(models.Model):
    session_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(
        TeacherAccount, on_delete=models.CASCADE, null=True)
    name = models.TextField()
    established = models.BooleanField(default=False)
    attendee_pw = models.CharField(max_length=120, null=True)
    moderator_pw = models.CharField(max_length=120, null=True)
    ended = models.BooleanField(default=False)

    def create_meeting(self):
        call = "create"
        parameters = {'name': 'naklar.io',
                      'meetingID': str(self.session_id),
                      'meta_endCallBackUrl': settings.HOST + "/roulette/end_callback?meetingID="+str(self.session_id),
                      'logoutURL': 'https://naklar.io/landingpage/mockup_end/',
                      'welcome': 'Herzlich willkommen bei naklar.io!'}
        # Key vor Release ändern!!!
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + "/bigbluebutton/api/" + \
            call + "?" + urlencode(parameters)
        r = requests.get(full_link)
        root = ET.fromstring(r.content)
        if r.status_code == 200:
            self.attendee_pw = root.find("attendeePW").text
            self.moderator_pw = root.find("moderatorPW").text
            self.established = True
#        self._add_webhook()
        self.save()

    def _add_webhook(self):
        call = 'hooks/create'
        parameters = {
            'callbackURL': settings.HOST + '/roulette/webhook_callback',
            'meetingID': str(self.session_id),
        }
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + '/bigbluebutton/api/' + \
            call + '?' + urlencode(parameters)
        print(full_link)
        r = requests.get(full_link)
        print(r.content)

    def end_meeting(self, delete_instance=True, close_session=True):
        call = "end"
        parameters = {'meetingID': str(self.session_id),
                      'password': self.moderator_pw}
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + "/bigbluebutton/api/" + \
            call + "?" + urlencode(parameters)
        r = requests.get(full_link)
        print(r.content)
        if delete_instance:
            self.delete()

    # Creates join-link for meeting, send this to the user

    def join_meeting(self, name="HansWurst", moderator=False):
        if self.established:
            call = "join"
            parameters = {'fullName': name,
                          'redirect': 'true',
                          'meetingID': str(self.session_id),
                          'password': self.moderator_pw if moderator else self.attendee_pw}
            add_checksum(call, parameters)
            full_link = settings.BBB_URL + "/bigbluebutton/api/" + \
                call + "?" + urlencode(parameters)
            return full_link
        return None

    def get_meeting_info(self):
        call = "getMeetingInfo"
        parameters = {
            'meetingID': str(self.session_id)
        }
        add_checksum(call, parameters)
        full_link = settings.BBB_URL + "/bigbluebutton/api/" + \
            call + "?" + urlencode(parameters)
        return requests.get(full_link).content


def meeting_deleted(sender, instance, using, **kwargs):
    instance.end_meeting(delete_instance=False)


def add_checksum(call, parameters):
    to_hash = call + urlencode(parameters) + settings.BBB_SHARED
    h = hashlib.sha1(to_hash.encode('utf-8'))
    parameters['checksum'] = h.hexdigest()


pre_delete.connect(meeting_deleted, Meeting)
