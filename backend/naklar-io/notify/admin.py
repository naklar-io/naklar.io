from django.contrib import admin

from notify.models import Notification, NotificationSettings, NotificationTimeRange, NotificationAction

# Register your models here.
admin.site.register(NotificationSettings)
admin.site.register(NotificationTimeRange)
admin.site.register(Notification)
admin.site.register(NotificationAction)