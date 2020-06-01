from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from roulette.models import StudentRequest, TutorRequest


class Command(BaseCommand):
    help = "deletes requests that haven't been polled since 30 seconds"

    def handle(self, *args, **options):
        r = StudentRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=20)).filter(is_active=True)
        for i in r:
            i.deactivate()
        r = TutorRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=60)).filter(is_active=True)
        for i in r:
            i.deactivate()
