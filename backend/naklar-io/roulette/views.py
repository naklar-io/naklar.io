import logging

from django.db.models import Q
from django_filters.rest_framework.backends import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import exceptions, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from roulette.mixins import (AccessPermissionMixin, MatchTypeMixin,
                             MatchUserMixin)
from roulette.models import Feedback, Report
from roulette.serializers import FeedbackSerializer, ReportSerializer

from .models import Match, Meeting, StudentRequest, TutorRequest
from .serializers import (MatchSerializer, MeetingSerializer)

logger = logging.getLogger(__name__)

# custom schema generation flags
match_answer_param = openapi.Parameter(
    'agree', openapi.IN_BODY, 'Agree with Match?', required=True, schema=openapi.Schema(type=openapi.TYPE_BOOLEAN))

schema = openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        'agree': openapi.Schema(type=openapi.TYPE_BOOLEAN)})

type_parameter = openapi.Parameter('type', openapi.IN_PATH, description='User type',
                                   required=True, type=openapi.TYPE_STRING, enum=['student', 'tutor'], )


class RequestView(MatchUserMixin, MatchTypeMixin, generics.CreateAPIView, generics.RetrieveAPIView, generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, AccessPermissionMixin]

    def perform_create(self, serializer):
        #        self.get_queryset().filter(user=self.request.user).delete()
        # TODO: Fix properly with custom object manager
        for i in self.get_queryset().filter(user=self.request.user):
            i.deactivate()
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.deactivate()
        # instance.manual_delete()


class MeetingListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeetingSerializer
    queryset = Meeting.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ended']

    def get_queryset(self):
        return self.queryset.filter(Q(student=self.request.user) | Q(tutor=self.request.user))


class ReportListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReportSerializer
    queryset = Report.objects.all()

    def get_queryset(self):
        return self.queryset.filter(Q(provider=self.request.user))

    def perform_create(self, serializer):
        meeting = serializer.validated_data.get('meeting')
        if meeting.student and meeting.tutor:
            provider = self.request.user
            receiver = meeting.tutor if provider == meeting.student else meeting.student
            serializer.save(provider=provider, receiver=receiver)
        else:
            raise ValidationError("Meeting muss Schüler und Tutor haben")


class FeedbackListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['provider', 'receiver']

    def get_queryset(self):
        return self.queryset.filter(Q(provider=self.request.user) | Q(receiver=self.request.user))

    def perform_create(self, serializer):
        meeting = serializer.validated_data.get('meeting')
        provider = self.request.user
        receiver = meeting.tutor if provider == meeting.student else meeting.student

        meeting.end_meeting()

        serializer.save(provider=provider, receiver=receiver)

class FeedbackDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()
    lookup_field = 'meeting'

    def get_queryset(self):
        return self.queryset.filter(Q(provider=self.request.user) | Q(receiver=self.request.user))

class MeetingDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeetingSerializer
    queryset = Meeting.objects.all()
    lookup_field = 'meeting_id'
    
    def get_queryset(self):
        return self.queryset.filter(users=self.request.user)



@swagger_auto_schema(method='POST', manual_parameters=[type_parameter], request_body=schema)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def match_answer(request, uuid, type):
    # first, find corresponding match
    match = Match.objects.filter(uuid=uuid)
    agree = request.data.get('agree', None)
    if agree is None:
        raise exceptions.ValidationError(detail="agree is missing!")

    if match:
        match = match.get()
    else:
        raise exceptions.NotFound()

    # check if user is authenticated
    if type == 'student' and match.student_request.user == request.user:
        # user is student
        match.student_agree = agree
        if not agree:
            match.delete()

        else:
            match.save()
        return Response({'success': True})
    elif type == 'tutor' and match.tutor_request.user == request.user:
        # user is tutor
        match.tutor_agree = agree
        if not agree:
            match.delete()
        else:
            match.save()
        return Response({'success': True})
    else:
        raise exceptions.NotAuthenticated()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_meeting_by_match(request, match_uuid):
    user = request.user
    match = Match.objects.filter(uuid=match_uuid)
    url = ""
    if match:
        match = match.get()
        if hasattr(match, 'meeting'):
            if user == match.student_request.user:
                url = match.meeting.create_join_link(user, moderator=False)
            elif user == match.tutor_request.user:
                url = match.meeting.create_join_link(user, moderator=True)
            else:
                raise exceptions.NotFound(detail="User not in meeting!")
    print(url)
    if url:
        return Response(data={'join_url': url, 'meeting_id': match.meeting.meeting_id})
    else:
        raise exceptions.NotFound(detail="No matching meeting found")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_meeting_by_id(request, meeting_id):
    user = request.user
    meeting: Meeting = get_object_or_404(Meeting, Q(tutor=user) | Q(
        student=user), meeting_id=meeting_id)
    url = ""
    if user == meeting.tutor:
        url = meeting.create_join_link(user, moderator=True)
    elif user == meeting.student:
        url = meeting.create_join_link(user, moderator=False)
    if url:
        return Response(data={'join_url': url, 'meeting_id': meeting.meeting_id})
    else:
        raise exceptions.NotFound(detail="No matching meeting found")


@api_view(['POST', 'GET'])
def end_callback(request, meeting):
    meeting = get_object_or_404(Meeting.objects.all(), pk=meeting)
    meeting.end_meeting()
    return Response(MeetingSerializer(instance=meeting).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def answer_request(request, id, type):
    if type == "tutor" and hasattr(request.user, 'studentdata'):
        tutor_request = get_object_or_404(
            TutorRequest.objects.all(), pk=id, is_active=True)

        # returning if corresponding match already exists
        match = Match.objects.filter(
            tutor_request=tutor_request, student=request.user)
        if not match:
            if Match.objects.filter(tutor_request=tutor_request).exists():
                raise exceptions.APIException(
                    detail="Request already has match!")
            # deleting all possible offenders by "yourself"
            Match.objects.filter(student=request.user).delete()
            match = Match.objects.create(
                tutor_request=tutor_request, tutor=tutor_request.user, student=request.user, student_agree=True)
        else:
            match = match.get()
    elif type == "student" and hasattr(request.user, 'tutordata'):
        student_request = get_object_or_404(
            StudentRequest.objects.all(), pk=id, is_active=True)
        # returning if corresponding match already exists
        match = Match.objects.filter(
            student_request=student_request, tutor=request.user)
        if not match:
            if Match.objects.filter(student_request=student_request).exists():
                raise exceptions.APIException(
                    detail="Request already has match!")
            match = Match.objects.create(
                student_request=student_request, student=student_request.user, tutor=request.user, tutor_agree=True)
        else:
            match = match.get()
    else:
        raise exceptions.NotFound(detail={"invalid type"})

    return Response(MatchSerializer(instance=match).data)
