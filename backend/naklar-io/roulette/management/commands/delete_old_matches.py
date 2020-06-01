from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from roulette.models import Match


class Command(BaseCommand):
    help = "deletes matches that haven't been answered (by one party) for more than 30 seconds"

    def handle(self, *args, **options):
        Match.objects.filter(student_agree=False).filter(tutor_agree=True).filter(
            changed_time__lte=timezone.now()-timedelta(seconds=30)).delete()
        Match.objects.filter(student_agree=True).filter(tutor_agree=False).filter(
            changed_time__lte=timezone.now()-timedelta(seconds=30)).delete()
        Match.objects.filter(student_agree=False).filter(tutor_agree=False).filter(
            changed_time__lte=timezone.now()-timedelta(seconds=35)).delete()
