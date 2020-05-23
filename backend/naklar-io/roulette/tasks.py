from celery import shared_task
from django.core.management import call_command


@shared_task
def deactivate_old_requests():
    call_command('delete_old_requests')
