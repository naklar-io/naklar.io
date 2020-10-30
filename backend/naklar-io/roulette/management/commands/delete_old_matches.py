from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from roulette.models import Match, MatchRejectReasons


class Command(BaseCommand):
    help = "fails matches that haven't been answered (by one party) for more than 30 seconds"

    def handle(self, *args, **options):
        active = Match.objects.filter(failed=False)

        for q in active.filter(student_agree=False).filter(tutor_agree=True).filter(
                changed_time__lte=timezone.now() - timedelta(seconds=30)):
            q.deactivate(MatchRejectReasons.STUDENT_TIMEOUT)

        for q in active.filter(student_agree=True).filter(tutor_agree=False).filter(
                changed_time__lte=timezone.now() - timedelta(seconds=30)):
            q.deactivate(MatchRejectReasons.TUTOR_TIMEOUT)

        for q in active.filter(student_agree=False).filter(tutor_agree=False).filter(
                changed_time__lte=timezone.now() - timedelta(seconds=35)):
            q.deactivate(MatchRejectReasons.BOTH_TIMEOUT)
