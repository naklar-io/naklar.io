import json
from datetime import timedelta

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from multiselectfield import MultiSelectField
from push_notifications.models import WebPushDevice
from post_office import mail


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
    STUDENT_REQUEST = 'SR'
    OTHER = 'OT'

    NOTIFICATION_TYPES = (
        (STUDENT_REQUEST, 'Student Request'),
        (OTHER, 'Other'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)

    notification_type = models.CharField(
        max_length=3, choices=NOTIFICATION_TYPES)
    title = models.TextField(verbose_name="Titel")
    body = models.TextField(verbose_name="Details")

    sent = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    reacted = models.BooleanField(default=False)
    reacted_date = models.DateTimeField(null=True, blank=True)

    # generic relation
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey()

    def send(self):
        """The send method assumes that sending is allowed
        """
        not_settings = self.user.notificationsettings
        if not_settings.enable_push:
            angular_payload = {
                "notification": {
                    "title": self.title,
                    "body": self.body,
                    "actions": [
                        {
                            "action": "explore",
                            "title": "Jetzt helfen!"
                        }
                    ],
                    "data": {
                        # TODO: Insert meaningful URLS (maybe with Sign-In-Tokens that expire in 1 Minute?)
                        "url": settings.HOST
                    }
                }
            }
            WebPushDevice.objects.filter(user=self.user).send_message(
                message=json.dumps(angular_payload))
        if not_settings.enable_mail:
            email_payload = {
                "msg": self.body,
                "subject": self.title
            }
            mail.send(self.user.email, sender="noreply@naklar.io",
                      template='notification', context=email_payload)
