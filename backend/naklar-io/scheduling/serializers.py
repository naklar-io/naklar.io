from django.contrib.auth import get_user_model
from rest_framework.fields import CurrentUserDefault, DateTimeField, DurationField, UUIDField
from rest_framework.relations import HyperlinkedRelatedField, HyperlinkedIdentityField
from rest_framework.serializers import Serializer, ModelSerializer, HyperlinkedModelSerializer
from rest_framework import fields

from account.models import CustomUser, Subject
from scheduling import models, validators


class TimeSlotSerializer(ModelSerializer):
    class Meta:
        model = models.TimeSlot
        fields = ['id', 'owner', 'start_time', 'duration', 'weekly']


class AppointmentSerializer(ModelSerializer):
    owner = CurrentUserDefault()

    class Meta:
        model = models.Appointment
        fields = ['id', 'owner', 'timeslot', 'start_time', 'duration', 'subject', 'topic']
        read_only_fields = ['owner']
        extra_kwargs = {
            # 'owner': {'pk_field': UUIDField(source='uuid')}
            # 'owner': {'view_name': 'account:user_view', 'lookup_field': 'uuid'},
            # 'timeslot': {'view_name': 'scheduling:timeslot-detail'},
            # 'subject': {'view_name': 'account:subject-detail'},
        }
        validators = [
            validators.no_overlaps
        ]


class AvailableSlotSerializer(Serializer):

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    parent = TimeSlotSerializer()
    start_time = DateTimeField(read_only=True)
    duration = DurationField(read_only=True)

