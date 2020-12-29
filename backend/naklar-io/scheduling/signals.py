from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from account.models import AccessCode
from scheduling.models import Appointment


@receiver(signal=post_save, sender=Appointment, dispatch_uid='appointment_created')
def appointment_created(instance: Appointment, sender, created, **kwargs):
    if created and instance.status == Appointment.Status.REQUESTED:
        instance.send_confirmation_request()
        if settings.NAKLAR_USE_ACCESS_CODES and hasattr(instance.owner, 'studentdata'):
            code = AccessCode.available_codes.filter(user=instance.owner).first()
            code.appointment = instance
            code.save()
