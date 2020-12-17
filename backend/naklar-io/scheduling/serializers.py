from django.utils.translation import gettext_lazy as _
from rest_framework.fields import DateTimeField, DurationField, UUIDField
from rest_framework.serializers import Serializer, ModelSerializer
from rest_framework.validators import UniqueTogetherValidator

from _shared.serializers import DynamicFieldsModelSerializer
from scheduling import models, validators
from scheduling.models import Appointment


class TimeSlotSerializer(DynamicFieldsModelSerializer):

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["owner"] = user
        return super(TimeSlotSerializer, self).create(validated_data)

    class Meta:
        model = models.TimeSlot
        fields = ['id', 'owner', 'start_time', 'duration', 'weekly']
        read_only_fields = ['owner']


class FullAppointmentSerializer(ModelSerializer):
    invitee = UUIDField(source='invitee.uuid', read_only=True)

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["owner"] = user
        return super(FullAppointmentSerializer, self).create(validated_data)

    class Meta:
        model = models.Appointment
        fields = [
            'id', 'owner', 'timeslot', 'start_time', 'duration', 'subject', 'topic', 'invitee', 'status'
        ]
        extra_kwargs = {
            'timeslot': {'allow_null': True},
            'subject': {'allow_null': False},
        }
        read_only_fields = ['owner', 'invitee', 'status']
        validators = [
            validators.AppointmentValidator(
                queryset=Appointment.objects.all()
            ),
            UniqueTogetherValidator(
                queryset=Appointment.objects.all(),
                fields=['timeslot', 'start_time'],
                message=_("Only one appointment can start at this time!")
            )
        ]


class AvailableSlotSerializer(Serializer):

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    # parent = TimeSlotSerializer(fields=['owner'])
    owner = UUIDField(source='parent.owner_id')
    start_time = DateTimeField(read_only=True)
    duration = DurationField(read_only=True)
    # subjects = PrimaryKeyRelatedField(source='parent.owner.tutordata.subjects.all', read_only=True, many=True)
