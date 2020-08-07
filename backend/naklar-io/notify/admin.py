from django.contrib import admin

from notify.models import Notification, NotificationSettings, NotificationTimeRange

# Register your models here.
admin.site.register(NotificationSettings)
admin.site.register(NotificationTimeRange)
admin.site.register(Notification)