from celery import shared_task, task
from django.core.management import call_command

from roulette import matching
from roulette.matching import generate_notifications


@shared_task(ignore_result=True)
def deactivate_old_requests():
    call_command('delete_old_requests')


@shared_task(ignore_result=True)
def delete_old_matches():
    call_command('delete_old_matches')

@shared_task(ignore_result=True)
def look_for_matches():
    return matching.look_for_matches()

@shared_task(ignore_result=True)
def send_request_notifications():
    return generate_notifications()
