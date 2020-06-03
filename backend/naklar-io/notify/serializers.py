from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework import fields, serializers

from notify.models import (DAY_CHOICES, NotificationSettings,
                           NotificationTimeRange)


class NotificationTimeRangeSerializer(serializers.ModelSerializer):
    days = fields.MultipleChoiceField(choices=DAY_CHOICES)

    class Meta:
        model = NotificationTimeRange
        fields = ('pk', 'days', 'start_time', 'end_time')


class NotificationSettingsSerializer(WritableNestedModelSerializer):
    ranges = NotificationTimeRangeSerializer(many=True)
    ranges_mode = fields.ChoiceField(NotificationSettings.MODE_CHOICES)

    
    class Meta:
        model = NotificationSettings
        fields = ('pk', 'user', 'enable_push', 'enable_mail', 'notify_interval', 'ranges', 'ranges_mode')
        read_only_fields = ('user', )
