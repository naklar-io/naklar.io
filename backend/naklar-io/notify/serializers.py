from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework import fields, serializers

from notify.models import (DAY_CHOICES, Notification, NotificationSettings,
                           NotificationTimeRange)
from roulette.models import StudentRequest
from roulette.serializers import StudentRequestSerializer


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
        fields = ('pk', 'user', 'enable_push', 'enable_mail',
                  'notify_interval', 'ranges', 'ranges_mode')
        read_only_fields = ('user', )


class ContentObjectField(serializers.RelatedField):
    """
    Represent content_objects in notification
    """

    def to_representation(self, value):
        if isinstance(value, StudentRequest):
            serializer = StudentRequestSerializer(value)
        else:
            return "Unknown: " + str(value)
        return serializer.data


class NotificationSerializer(serializers.ModelSerializer):
    content_object = ContentObjectField(read_only=True)

    class Meta:
        model = Notification
        fields = ('pk', 'notification_type', 'title',
                  'body', 'sent', 'date', 'content_object')
        read_only_fields = ('content_object', )
