from django.conf import settings
from rest_framework import serializers

from account.serializers import CustomUserSerializer
from roulette.models import (Feedback, Match, Meeting, Report, Request,
                             StudentRequest, TutorRequest)


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
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


class FeedbackSerializer(serializers.ModelSerializer):
    #receiver = serializers.HyperlinkedRelatedField(queryset=settings.AUTH_USER_MODEL, view_name="user_view")
    class Meta:
        model = Feedback
        fields = ['receiver', 'provider', 'rating',
                  'message', 'meeting', 'created']
        read_only_fields = ['receiver', 'provider', 'created']
        extra_kwargs = {
            'rating': {'required': True},
            'meeting': {'required': True}
        }


class MatchSerializer(DynamicFieldsModelSerializer):
    #tutor_uuid = serializers.ReadOnlyField(source='tutor_request.user.uuid')
    tutor = CustomUserSerializer(source='tutor_request.user', read_only=True)
    student = CustomUserSerializer(
        source='student_request.user', read_only=True)
    #student_uuid = serializers.ReadOnlyField(source='student_request.user.uuid')
    subject = serializers.ReadOnlyField(source='student_request.subject.id')

    class Meta:
        model = Match
        fields = ['uuid', 'student_agree', 'tutor_agree',
                  'tutor', 'student', 'subject']


class TutorRequestSerializer(serializers.ModelSerializer):
    match = MatchSerializer(required=False)

    class Meta:
        model = TutorRequest
        fields = ['match', 'failed_matches', 'created', ]
        read_only_fields = ['match', 'failed_matches', 'created']


class StudentRequestSerializer(serializers.ModelSerializer):
    match = MatchSerializer(required=False)

    class Meta:
        model = StudentRequest
        fields = ['subject', 'match', 'failed_matches', 'created']
        read_only_fields = ['match', 'failed_matches', 'created']


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['meeting_id', 'ended',
                  'time_ended', 'student', 'tutor', 'name', 'feedback_set']


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['provider', 'receiver', 'message', 'meeting', 'created']
        read_only_fields = ['provider', 'receiver', 'created']
        extra_kwargs = {
            'message': {'required': True},
            'meeting': {'required': True}
        }
