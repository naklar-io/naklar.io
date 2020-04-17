import logging
import threading
import time
from datetime import timedelta

from django.utils import timezone
from schedule import Scheduler

from .models import StudentRequest, TutorRequest

logger = logging.getLogger(__name__)


def delete_old_requests():
    r = StudentRequest.objects.filter(
        last_poll__lte=timezone.now()-timedelta(seconds=30))
    for i in r:
        logger.info("Deleting StudentRequest with last_poll:"+str(i.last_poll))
        i.manual_delete()
    r = TutorRequest.objects.filter(
        last_poll__lte=timezone.now()-timedelta(seconds=30))
    for i in r:
        logger.info("Deleting TutorRequest with last_poll:"+str(i.last_poll))
        i.manual_delete()


def run_continuously(self, interval=1):
    """Continuously run, while executing pending jobs at each elapsed
    time interval.
    @return cease_continuous_run: threading.Event which can be set to
    cease continuous run.
    Please note that it is *intended behavior that run_continuously()
    does not run missed jobs*. For example, if you've registered a job
    that should run every minute and you set a continuous run interval
    of one hour then your job won't be run 60 times at each interval but
    only once.
    """

    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):

        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                self.run_pending()
                time.sleep(interval)

    continuous_thread = ScheduleThread()
    continuous_thread.setDaemon(True)
    continuous_thread.start()
    return cease_continuous_run


Scheduler.run_continuously = run_continuously


def start_scheduler():
    scheduler = Scheduler()
    scheduler.every(5).seconds.do(delete_old_requests)
    scheduler.run_continuously()
    logger.info("Scheduler started.")
