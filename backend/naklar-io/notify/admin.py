from django.contrib import admin

from notify.models import NotificationTimeRange, NotificationSettings

# Register your models here.
admin.site.register(NotificationSettings)
admin.site.register(NotificationTimeRange)