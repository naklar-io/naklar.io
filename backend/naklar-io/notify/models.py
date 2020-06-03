from datetime import timedelta

from django.conf import settings
from django.db import models
from multiselectfield import MultiSelectField


class NotificationSettings(models.Model):
    """Contains notification settings for one user
    """
    user = models.OneToOneField(
        to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    enable_push = models.BooleanField(default=False)
    enable_mail = models.BooleanField(default=False)

    notify_interval = models.DurationField(
        verbose_name="Minimaler Abstand zwischen Benachrichtigungen", default=timedelta(minutes=5))

    # Range modes
    RANGE_ALLOW = 'ALLOW'
    RANGE_BLOCK = 'BLOCK'
    MODE_CHOICES = [
        (RANGE_ALLOW, 'Während dieser Zeiten erlauben'),
        (RANGE_BLOCK, 'Während dieser Zeiten verbieten'),
    ]
    ranges_mode = models.CharField(
        default=RANGE_ALLOW, max_length=10, choices=MODE_CHOICES)
    ranges = models.ManyToManyField(to='notify.NotificationTimeRange')


DAY_CHOICES = (
    (0, 'Montag'),
    (1, 'Dienstag'),
    (2, 'Mittwoch'),
    (3, 'Donnerstag'),
    (4, 'Freitag'),
    (5, 'Samstag'),
    (6, 'Sonntag'),
)


class NotificationTimeRange(models.Model):
    """Specifies a time range that notifications may occur in
    """
    days = MultiSelectField(choices=DAY_CHOICES)
    start_time = models.TimeField(verbose_name="Startzeit am Tag")
    end_time = models.TimeField(verbose_name="Endzeit am Tag")


class Notification(models.Model):
    """Models a notification to be sent to the user

    Purposes: 
    - Ensure interval is limited to specific settings
    - User is able to (re)view notifications that he got
    - Store notification content
    - Provide abstraction over WebPush/Mail/More?
    """
