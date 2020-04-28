from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import CustomUser, SchoolData, SchoolType, State, Subject, VerificationToken
from django.core import mail


class AccountCreateTest(APITestCase):
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
