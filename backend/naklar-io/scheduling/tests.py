from django.core.management import call_command
from django.test import TestCase

# Create your tests here.
from rest_framework.test import APITestCase


class ConfirmEmailTimeoutTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('populate_database')
