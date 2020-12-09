from django.utils.translation import gettext_lazy as _
from rest_framework.fields import CurrentUserDefault, DateTimeField, DurationField, HiddenField
from rest_framework.serializers import Serializer, ModelSerializer
from rest_framework.validators import UniqueTogetherValidator

from scheduling import models, validators
from scheduling.models import Appointment


class TimeSlotSerializer(ModelSerializer):
    class Meta:
        model = models.TimeSlot
        fields = ['id', 'owner', 'start_time', 'duration', 'weekly']


class AppointmentSerializer(ModelSerializer):
    owner = CurrentUserDefault()

    class Meta:
        model = models.Appointment
        fields = ['id', 'owner', 'timeslot', 'start_time', 'duration', 'subject', 'topic']
        extra_kwargs = {
            # 'owner': {'pk_field': UUIDField(source='uuid')}
            # 'owner': {'view_name': 'account:user_view', 'lookup_field': 'uuid'},
            # 'timeslot': {'view_name': 'scheduling:timeslot-detail'},
            # 'subject': {'view_name': 'account:subject-detail'},
        }
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

    parent = TimeSlotSerializer()
    start_time = DateTimeField(read_only=True)
    duration = DurationField(read_only=True)
