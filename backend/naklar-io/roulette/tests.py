from datetime import timedelta
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from account.models import SchoolType, SchoolData, Subject, State, CustomUser, StudentData, TutorData
from roulette.models import TutorRequest, StudentRequest, Match, MatchRejectReasons
from roulette.tasks import look_for_matches, deactivate_old_requests, delete_old_matches


@override_settings(
    CELERY_TASK_EAGER_PROPAGATES=True,
    CELERY_TASK_ALWAYS_EAGER=True,
    BROKER_BACKEND='memory',
)
class KeepMatchDataTest(APITestCase):
    match_answer_student = "/roulette/student/match/answer/"
    match_answer_tutor = "/roulette/tutor/match/answer/"

    @classmethod
    def setUpTestData(cls):
        cls.school_type = SchoolType.objects.create(name="Testschooltype1")
        cls.school_data = SchoolData.objects.create(
            school_type=cls.school_type, grade=10)
        cls.subject = Subject.objects.create(name="TestSubject")
        cls.state = State.objects.create(name="Teststate1")
        cls.student_pw = "12345678"
        cls.student = CustomUser.objects.create_user(
            "student@test.com", "Student", cls.state, cls.student_pw)
        cls.student.email_verified = True
        cls.student.save()
        cls.student_data = StudentData.objects.create(
            user=cls.student, school_data=cls.school_data)
        cls.tutor_pw = "12345678"
        cls.tutor = CustomUser.objects.create_user(
            "tutor@test.com", "Tutor", cls.state, cls.tutor_pw, last_name="Lastname")
        cls.tutor.email_verified = True
        cls.tutor.save()
        cls.tutor_data = TutorData.objects.create(user=cls.tutor, verified=True)
        cls.tutor_data.schooldata.set([cls.school_data])
        cls.tutor_data.subjects.set([cls.subject])

    def setUp(self):
        self.tutor_request = TutorRequest.objects.create(user=self.tutor)
        self.student_request = StudentRequest.objects.create(user=self.student, subject=self.subject)

    def check_match_creation(self):
        look_for_matches()
        self.assertEqual(1, Match.objects.count(), "Match needs to be created")
        match = Match.objects.get()
        self.assertEqual(self.tutor, match.tutor, "Match user needs to match")
        self.assertEqual(self.student, match.student, "Match user needs to match")
        self.assertEqual(self.student_request, match.student_request, "Requests need to match")
        self.assertEqual(self.tutor_request, match.tutor_request, "Requests need to match")

    @patch('roulette.models.Meeting.create_meeting')
    def test_successful_match(self, create_meeting):
        self.check_match_creation()
        match = Match.objects.get()
        data = {
            'agree': True
        }
        self.client.force_authenticate(self.student)
        request_url = f"{self.match_answer_student}{str(Match.objects.get().uuid)}/"
        response = self.client.post(request_url, data=data, format='json')
        self.assertEqual(200, response.status_code, "Student accept needs to be successful")

        self.client.force_authenticate(self.tutor)
        request_url = f"{self.match_answer_tutor}{str(Match.objects.get().uuid)}/"
        response = self.client.post(request_url, data=data, format='json')
        self.assertEqual(200, response.status_code, "Tutor accept needs to be successful")
        self.assertEqual(MatchRejectReasons.OTHER_REASON, Match.objects.get().fail_reason, )
        self.assertTrue(Match.objects.get().successful)
        # create meeting should've been called once
        create_meeting.assert_called_once()

    @patch('roulette.models.Meeting.create_meeting')
    def test_student_reject(self, create_meeting):
        self.check_match_creation()
        self.client.force_authenticate(self.student)
        data = {
            'agree': False
        }
        request_url = f"{self.match_answer_student}{str(Match.objects.get().uuid)}/"
        response = self.client.post(request_url, data=data, format='json')
        self.assertEqual(200, response.status_code, "Reject needs to be successful")

        self.assertEqual(MatchRejectReasons.STUDENT_REJECT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_tutor_reject(self, create_meeting):
        self.check_match_creation()
        self.client.force_authenticate(self.tutor)
        data = {
            'agree': False
        }
        request_url = f"{self.match_answer_tutor}{str(Match.objects.get().uuid)}/"
        response = self.client.post(request_url, data=data, format='json')
        self.assertEqual(200, response.status_code, "Reject needs to be successful")

        self.assertEqual(MatchRejectReasons.TUTOR_REJECT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_student_disconnect(self, create_meeting):
        self.check_match_creation()
        self.tutor_request.connected_count = 1
        self.tutor_request.save()
        self.student_request.last_poll = timezone.now() - timedelta(seconds=30)
        self.student_request.save()
        deactivate_old_requests()

        self.assertEqual(MatchRejectReasons.STUDENT_DISCONNECT, Match.objects.get().fail_reason,
                         "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_tutor_disconnect(self, create_meeting):
        self.check_match_creation()
        self.student_request.connected_count = 1
        self.student_request.save()
        self.tutor_request.last_poll = timezone.now() - timedelta(seconds=60)
        self.tutor_request.save()
        deactivate_old_requests()

        self.assertEqual(MatchRejectReasons.TUTOR_DISCONNECT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_tutor_timeout(self, create_meeting):
        self.check_match_creation()
        match = Match.objects.get()
        match.student_agree = True
        match.save()
        Match.objects.all().update(changed_time=timezone.now() - timedelta(seconds=30))
        delete_old_matches()

        self.assertEqual(MatchRejectReasons.TUTOR_TIMEOUT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_student_timeout(self, create_meeting):
        self.check_match_creation()
        match = Match.objects.get()
        match.tutor_agree = True
        match.save()
        Match.objects.all().update(changed_time=timezone.now() - timedelta(seconds=30))
        delete_old_matches()

        self.assertEqual(MatchRejectReasons.STUDENT_TIMEOUT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()

    @patch('roulette.models.Meeting.create_meeting')
    def test_both_timeout(self, create_meeting):
        self.check_match_creation()
        Match.objects.all().update(changed_time=timezone.now() - timedelta(seconds=35))
        delete_old_matches()

        self.assertEqual(MatchRejectReasons.BOTH_TIMEOUT, Match.objects.get().fail_reason, "Reason needs to match")
        self.assertFalse(Match.objects.get().successful)
        self.assertTrue(Match.objects.get().failed)
        # meeting shouldn't be created
        create_meeting.assert_not_called()
