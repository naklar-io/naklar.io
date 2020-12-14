from django.db.models.signals import post_save
from django.dispatch import receiver

from scheduling.models import Appointment


@receiver(signal=post_save, sender=Appointment, dispatch_uid='appointment_created')
def appointment_created(instance: Appointment, sender, created, **kwargs):
    if created and not instance.is_confirmed:
        instance.send_confirmation_request()
