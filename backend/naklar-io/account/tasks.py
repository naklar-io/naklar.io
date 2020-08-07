from celery.app import shared_task

@shared_task(serializer='pickle')
def send_email_task(msg):
    return msg.send()