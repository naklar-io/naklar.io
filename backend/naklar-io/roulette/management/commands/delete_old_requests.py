from django.core.management.base import BaseCommand
from roulette.models import StudentRequest, TutorRequest
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = "deletes requests that haven't been polled since 30 seconds"

    def handle(self, *args, **options):
        r = StudentRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=30))
        for i in r:
            i.manual_delete()
        r = TutorRequest.objects.filter(
            last_poll__lte=timezone.now()-timedelta(seconds=30))
        for i in r:
            i.manual_delete()
        print("deleted!")