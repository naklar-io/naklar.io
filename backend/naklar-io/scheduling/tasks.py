import logging

from datetime import timedelta

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)

CONFIRM_TIMEOUT_MINUTES = 30


@shared_task(ignore_result=True)
def confirm_email_timeout():
    from scheduling.models import Appointment
    qs = Appointment.objects.filter(
        status=Appointment.Status.REQUESTED,
        start_time__gt=timezone.now(),
        confirmation_request_time__lte=timezone.now() - timedelta(minutes=CONFIRM_TIMEOUT_MINUTES)
    )
    logger.debug(f"confirmation timeout reached for {qs.count()} appointments")
    for ap in qs:
        ap.handle_rejection(ap.invitee)


@shared_task(ignore_result=True)
def send_appointment_reminder():
    from scheduling.models import Appointment
    qs = Appointment.objects.filter(
        status__in=[Appointment.Status.CONFIRMED, Appointment.Status.OWNER_STARTED, Appointment.Status.INVITEE_STARTED],
        reminded=False,
        start_time__gte=timezone.now()-timedelta(minutes=20)
    )
    for ap in qs:
        ap.send_reminder()
