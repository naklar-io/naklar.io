from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from roulette.models import StudentRequest, TutorRequest


class Command(BaseCommand):
    help = "deletes requests that haven't been polled since 30 seconds"

    def handle(self, *args, **options):
        r = StudentRequest.objects.filter(
            is_active=True,
            connected_count=0,
            last_poll__lte=timezone.now()-timedelta(seconds=20))
        for i in r:
            i.deactivate(connection_lost=True)
        r = TutorRequest.objects.filter(
            is_active=True,
            connected_count=0,
            last_poll__lte=timezone.now()-timedelta(seconds=20))
        for i in r:
            i.deactivate(connection_lost=True)
