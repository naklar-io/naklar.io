import base64
import json
import uuid
from django.core import mail
from django.urls import reverse
from django.test import override_settings, modify_settings
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import CustomUser, SchoolData, SchoolType, State, StudentData, Subject, TutorData, \
    VerificationToken, TrackingDenyCounter


@override_settings(CELERY_TASK_EAGER_PROPAGATES=True,
                   CELERY_TASK_ALWAYS_EAGER=True,
                   BROKER_BACKEND='memory',
                   EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AccountCreateTest(APITestCase):
    """
    Account creation test cases
    """

    @classmethod
    def setUpTestData(cls):
        cls.state = State.objects.create(name="Teststate")
        cls.school_type = SchoolType.objects.create(name="Testschooltype")
        cls.school_data = SchoolData.objects.create(
            school_type=cls.school_type, grade=10)
        cls.subject = Subject.objects.create(name="TestSubject")

    def test_create_student_account(self):
        """
        Ensure account creation works
        """
        url = reverse('account:account_create')
        data = {'firstName': 'Bob',
                'state': self.state.id,
                'gender': 'MA',
                'email': 'bob@test.com',
                'password': '12345678',
                'studentdata': {
                    'schoolData': self.school_data.id
                }}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(CustomUser.objects.count(), 1)
        user = CustomUser.objects.get()
        self.assertEqual(user.first_name, 'Bob')
        self.assertEqual(user.email, 'bob@test.com')
        self.assertEqual(user.state, self.state)

        self.assertEqual(user.studentdata.school_data, self.school_data)

        self.assertFalse(hasattr(user,
                                 'tutordata'), "Student shouldn't have tutordata")

        self.assertEqual(len(mail.outbox), 1)
        self.assertFalse(user.email_verified)
        self.assertTrue(VerificationToken.objects.filter(
            user=user).exists())

    def test_create_tutor_account(self):
        """
        Ensure account creation works
        """
        url = reverse('account:account_create')
        data = {'firstName': 'Bob',
                'lastName': 'Streisand',
                'state': self.state.id,
                'gender': 'MA',
                'email': 'bob@test.com',
                'password': '12345678',
                'tutordata': {
                    'schooldata': [self.school_data.id],
                    'subjects': [self.subject.id]
                }}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 1 object was created
        self.assertEqual(CustomUser.objects.count(), 1)

        user = CustomUser.objects.get()
        # user equals created user
        self.assertEqual(user.first_name, 'Bob')
        self.assertEqual(user.last_name, 'Streisand')
        self.assertEqual(user.email, 'bob@test.com')
        self.assertEqual(user.state, self.state)

        # check tutordata
        self.assertSequenceEqual(
            user.tutordata.schooldata.all(), [self.school_data])
        self.assertSequenceEqual(
            user.tutordata.subjects.all(), [self.subject])

        # studentdata may not be filled
        self.assertFalse(hasattr(CustomUser.objects.get(
        ), 'studentdata'), "Tutor account may not have studentdata")

        # check email verified status
        self.assertEqual(len(mail.outbox), 1)
        self.assertFalse(user.email_verified)
        self.assertTrue(VerificationToken.objects.filter(
            user=user).exists())


@override_settings(CELERY_TASK_EAGER_PROPAGATES=True,
                   CELERY_TASK_ALWAYS_EAGER=True,
                   BROKER_BACKEND='memory')
class AccountLoginTest(APITestCase):
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
        cls.student_data = StudentData.objects.create(
            user=cls.student, school_data=cls.school_data)
        cls.tutor_pw = "12345678"
        cls.tutor = CustomUser.objects.create_user(
            "tutor@test.com", "Tutor", cls.state, cls.tutor_pw, last_name="Lastname")
        cls.tutor_data = TutorData(
            user=cls.tutor)
        cls.tutor_data.save()
        cls.tutor_data.schooldata.set([cls.school_data])
        cls.tutor_data.subjects.set([cls.subject])

    def test_login_student_account(self):
        """
        test logging in and retrieving student account
        """
        credential_string = f"{self.student.email}:{self.student_pw}".encode(
            'utf-8')
        self.client.credentials(HTTP_AUTHORIZATION='Basic ' +
                                                   base64.b64encode(credential_string).decode('utf-8'))
        response = self.client.post(reverse('account:knox_login'))
        self.assertEqual(response.status_code, 200)
        token = response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.get(reverse('account:account_view'))
        self.assertEqual(response.data['first_name'], self.student.first_name)
        self.assertEqual(response.data['email'], self.student.email)
        self.assertEqual(
            response.data['studentdata']['school_data'], self.student.studentdata.school_data.id)

    def test_login_tutor_account(self):
        """
        test logging in and retrieving tutor account
        """
        credential_string = f"{self.tutor.email}:{self.tutor_pw}".encode(
            'utf-8')
        self.client.credentials(HTTP_AUTHORIZATION='Basic ' +
                                                   base64.b64encode(credential_string).decode('utf-8'))
        response = self.client.post(reverse('account:knox_login'))
        self.assertEqual(response.status_code, 200)
        token = response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.get(reverse('account:account_view'))
        self.assertEqual(response.data['first_name'], self.tutor.first_name)
        self.assertEqual(response.data['last_name'], self.tutor.last_name)
        self.assertEqual(response.data['email'], self.tutor.email)
        self.assertSequenceEqual(
            response.data['tutordata']['schooldata'], self.tutor_data.schooldata.values_list('id', flat=True))
        self.assertSequenceEqual(
            response.data['tutordata']['subjects'], self.tutor_data.subjects.values_list('id', flat=True))

    def test_email_verify(self):
        """
        test email-verification link works
        """


@override_settings(CELERY_TASK_EAGER_PROPAGATES=True,
                   CELERY_TASK_ALWAYS_EAGER=True,
                   BROKER_BACKEND='memory')
class AccountChangeTest(APITestCase):
    """
    Account change test-cases
    """

    @classmethod
    def setUpTestData(cls):
        cls.school_type1 = SchoolType.objects.create(name="Testschooltype1")
        cls.school_type2 = SchoolType.objects.create(name="Testschooltype2")
        cls.school_data1 = SchoolData.objects.create(
            school_type=cls.school_type1, grade=10)
        cls.school_data2 = SchoolData.objects.create(
            school_type=cls.school_type2, grade=6)
        cls.subject1 = Subject.objects.create(name="TestSubject")
        cls.subject2 = Subject.objects.create(name="TestSubject")
        cls.state1 = State.objects.create(name="Teststate1")
        cls.state2 = State.objects.create(name="Teststate2")

    def setUp(self):
        self.student = CustomUser.objects.create_user(
            "student@test.com", "Student", self.state1, "12345678", email_verified=True)
        self.student_data = StudentData.objects.create(
            user=self.student, school_data=self.school_data1)
        self.tutor = CustomUser.objects.create_user(
            "tutor@test.com", "Tutor", self.state1, "12345678", email_verified=True)
        self.tutor_data = TutorData(
            user=self.tutor)
        self.tutor_data.save()
        self.tutor_data.schooldata.set([self.school_data1])
        self.tutor_data.subjects.set([self.subject1])

    def test_patch_student_account(self):
        self.client.force_authenticate(self.student)
        data = {
            'firstName': 'Student2',
            'email': 'otherstudent@test.com',
            'state': self.state2.id,
            'studentdata': {
                'school_data': self.school_data2.id
            }
        }

        response = self.client.patch(
            reverse("account:account_view"), data=data, format='json')
        self.assertEqual(response.status_code, 200)
        student = CustomUser.objects.get(id=self.student.id)
        self.assertEqual(student.first_name, 'Student2')
        self.assertEqual(student.email, 'otherstudent@test.com')
        self.assertEqual(student.state, self.state2)
        self.assertEqual(student.studentdata.school_data, self.school_data2)

        # check email verified status (email changed)
        self.assertEqual(len(mail.outbox), 1)
        self.assertFalse(student.email_verified)
        self.assertTrue(VerificationToken.objects.filter(
            user=student).exists())

    def test_patch_tutor_account(self):
        self.client.force_authenticate(self.tutor)
        data = {
            'firstName': 'Tutor2',
            'email': 'othertutor@test.com',
            'tutordata': {
                'schooldata': [self.school_data1.id, self.school_data2.id],
                'subjects': [self.subject1.id, self.subject2.id]
            },
            'state': self.state2.id
        }
        response = self.client.patch(
            reverse("account:account_view"), data=data, format='json')
        self.assertEqual(response.status_code, 200)
        tutor = CustomUser.objects.get(id=self.tutor.id)

        self.assertEqual(tutor.first_name, 'Tutor2')
        self.assertEqual(tutor.email, 'othertutor@test.com')
        self.assertEqual(tutor.state, self.state2)

        self.assertSetEqual(set(tutor.tutordata.schooldata.all()), set(
            [self.school_data1, self.school_data2]))
        self.assertSetEqual(set(tutor.tutordata.subjects.all()),
                            set([self.subject1, self.subject2]))

        # check email verified status (email changed)
        self.assertEqual(len(mail.outbox), 1)
        self.assertFalse(tutor.email_verified)
        self.assertTrue(VerificationToken.objects.filter(
            user=tutor).exists())


@override_settings(CELERY_TASK_EAGER_PROPAGATES=True,
                   CELERY_TASK_ALWAYS_EAGER=True,
                   BROKER_BACKEND='memory')
class EmailVerifyTest(APITestCase):
    """
    Test if email verification API works
    """

    @classmethod
    def setUpTestData(cls):
        cls.school_type = SchoolType.objects.create(name="TestSchoolType")
        cls.school_data = SchoolData.objects.create(
            school_type=cls.school_type, grade=10)
        cls.state = State.objects.create(name="TestState")

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            first_name="Bob", email="bob@example.com", state=self.state)

    def test_email_verify(self):
        self.assertTrue(VerificationToken.objects.filter(
            user=self.user).exists())
        token = VerificationToken.objects.get(user=self.user)
        response = self.client.post(
            reverse("account:email_verify", args=[token.token]))
        user = CustomUser.objects.get()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(user.email_verified)
        self.assertFalse(VerificationToken.objects.all().exists())

    def test_email_verify_fail(self):
        response = self.client.post(
            reverse("account:email_verify", args=[uuid.uuid4()]))
        user = CustomUser.objects.get()
        self.assertEqual(response.status_code, 404)
        self.assertFalse(user.email_verified)
        self.assertTrue(VerificationToken.objects.all().exists())


class TrackingDenyCounterTest(APITestCase):
    def test_tracking_deny(self):
        self.assertEqual(0, TrackingDenyCounter.load().count)
        url = reverse("account:count_tracking_deny")
        response = self.client.post(url)
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, TrackingDenyCounter.load().count)
