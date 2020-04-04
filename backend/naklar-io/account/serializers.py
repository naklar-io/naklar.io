from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from account.models import Subject, State, CustomUser, StudentData, \
    TutorData, SchoolData, SchoolType
from account.managers import CustomUserManager


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


class TutorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorData
        fields = ['schooldata', 'subjects']


class CurrentUserSerializer(serializers.ModelSerializer):
    studentdata = StudentDataSerializer(required=False, allow_null=True)
    tutordata = TutorDataSerializer(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name',
                  'state', 'password', 'studentdata', 'tutordata']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        studentdata, tutordata = None

        if 'studendata' in validated_data:
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
                tutordata.save()
        return super(CurrentUserSerializer, self).update(instance, validated_data)


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["uuid", "first_name", "last_name",
                  "state", "studentdata", "tutordata"]
        lookup_field = "uuid"
