from django.utils.translation import gettext_lazy as _
from rest_framework.fields import CurrentUserDefault, DateTimeField, DurationField, HiddenField, UUIDField
from rest_framework.serializers import Serializer, ModelSerializer
from rest_framework.validators import UniqueTogetherValidator

from _shared.serializers import DynamicFieldsModelSerializer, DynamicReadOnlyFieldsModelSerializer
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
    def validate_timeslot(self, timeslot):
        if timeslot is None:
            # this is where our matching algorithm comes into play!?!
            print(self.initial_data)

        return timeslot

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["owner"] = user
        return super(FullAppointmentSerializer, self).create(validated_data)

    class Meta:
        model = models.Appointment
        fields = ['id', 'owner', 'timeslot', 'start_time', 'duration', 'subject', 'topic']
        extra_kwargs = {
            # 'owner': {'pk_field': UUIDField(source='uuid')}
            # 'owner': {'view_name': 'account:user_view', 'lookup_field': 'uuid'},
            # 'timeslot': {'view_name': 'scheduling:timeslot-detail'},
            # 'subject': {'view_name': 'account:subject-detail'},
            'timeslot': {'allow_null': True}
        }
        read_only_fields = ['owner']
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
    owner = UUIDField(source='parent.owner.uuid')
    start_time = DateTimeField(read_only=True)
    duration = DurationField(read_only=True)
