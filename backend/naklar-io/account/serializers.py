from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from _shared.serializers import DynamicFieldsModelSerializer
from account.models import (CustomUser, SchoolData,
                            SchoolType, State, StudentData, Subject, TutorData)


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
        read_only_fields = ['email_verified']
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
            tutor.verification_file = tutordata.get('verification_file')
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
                StudentData.objects.update_or_create(user=instance, defaults=data)
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

    def validate_email(self, value):
        if CustomUser.objects.filter(email__iexact=value).exists():
            if self.instance.email != value:
                raise serializers.ValidationError("Nutzer mit dieser Mail existiert bereits!")
        return value


class CustomUserSerializer(serializers.ModelSerializer):
    tutordata = TutorDataSerializer(fields=['schooldata', 'subjects', 'profile_picture'])
    studentdata = StudentDataSerializer()

    class Meta:
        model = CustomUser
        fields = ["uuid", "first_name",
                  "state", "studentdata", "tutordata", "gender"]
        lookup_field = "uuid"


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = get_user_model().objects.filter(email=value)
        if user.exists():
            return value
        else:
            raise serializers.ValidationError(
                _("Kein Nutzer mit dieser E-Mail gefunden!"))

    def save(self):
        user = CustomUser.objects.get(email=self.validated_data['email'])
        user.send_reset_mail()
