from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from account.models import Subject, State, CustomUser, StudentData, \
    TutorData, SchoolData, SchoolType
from account.managers import CustomUserManager
from drf_base64.fields import Base64FileField
from drf_base64.serializers import ModelSerializer


class DynamicFieldsModelSerializer(ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'


class SchoolTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolType
        fields = '__all__'


class SchoolDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolData
        fields = '__all__'


class StudentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentData
        fields = ['school_data']


class TutorDataSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = TutorData
        fields = ['schooldata', 'subjects',
                  'verification_file', 'verified', 'profile_picture']
        read_only_fields = ['verified']


class CurrentUserSerializer(serializers.ModelSerializer):
    studentdata = StudentDataSerializer(required=False, allow_null=True)
    tutordata = TutorDataSerializer(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ['uuid', 'email', 'email_verified', 'first_name', 'last_name', 'gender',
                  'state', 'password', 'studentdata', 'tutordata']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        studentdata = None
        tutordata = None

        if 'studentdata' in validated_data:
            studentdata = validated_data.pop('studentdata')
        if 'tutordata' in validated_data:
            tutordata = validated_data.pop('tutordata')

        # Create user, then set studentdata and tutordata if exists
        instance = CustomUser.objects.create_user(**validated_data)
        if studentdata:
            StudentData.objects.update_or_create(user=instance, **studentdata)
        if tutordata:
            tutor, _ = TutorData.objects.get_or_create(user=instance)
            tutor.schooldata.set(tutordata.get('schooldata'))
            tutor.subjects.set(tutordata.get('subjects'))
            tutor.verfication_file = tutordata.get('verification_file')
            tutor.profile_picture = tutordata.get('profile_picture')
            tutor.save()

        return instance

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        if 'studentdata' in validated_data:
            data = validated_data.pop('studentdata')
            if not data:
                StudentData.objects.filter(user=instance).delete()
            else:
                StudentData.objects.update_or_create(user=instance, **data)
        if 'tutordata' in validated_data:
            data = validated_data.pop('tutordata')
            if not data:
                TutorData.objects.filter(user=instance).delete()
            else:
                tutordata, _ = TutorData.objects.get_or_create(user=instance)
                tutordata.schooldata.set(data.get('schooldata'))
                tutordata.subjects.set(data.get('subjects'))
                if data.get('verification_file'):
                    tutordata.verification_file = data.get('verification_file')
                if data.get('profile_picture'):
                    tutordata.profile_picture = data.get('profile_picture')
                tutordata.save()
        return super(CurrentUserSerializer, self).update(instance, validated_data)


class CustomUserSerializer(serializers.ModelSerializer):
    tutordata = TutorDataSerializer(fields=['schooldata', 'subjects'])

    class Meta:
        model = CustomUser
        fields = ["uuid", "first_name", "last_name",
                  "state", "studentdata", "tutordata", "gender"]
        lookup_field = "uuid"
