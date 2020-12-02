import time

from celery import shared_task
from django.core.management import call_command


@shared_task(ignore_result=True)
def send_queued_mails():
    start_time = time.monotonic()
    call_command('send_queued_mail', processes=5)
    elapsed_time = time.monotonic() - start_time
    print(f"Elapsed: {elapsed_time}s")

