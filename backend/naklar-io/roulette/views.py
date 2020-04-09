from django.db.models import Q
from django_filters.rest_framework.backends import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import exceptions, generics, mixins, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from roulette.models import Feedback
from roulette.serializers import FeedbackSerializer

from .models import Match, Meeting, Request, StudentRequest, TutorRequest
from .serializers import (MatchSerializer, MeetingSerializer,
                          StudentRequestSerializer, TutorRequestSerializer)


class MatchUserMixin(object):
    """
    Matches user argument to be user
    """

    def get_object(self):
        obj = self.get_queryset().filter(user=self.request.user)
        if obj:
            return obj.get()
        else:
            raise exceptions.NotFound(detail="Kein Request gefunden!")


class MatchTypeMixin(object):
    """
    Matches type argument to be either student/tutor
    """

    def get_serializer_class(self):
        type = self.kwargs.get('type', None)
        if type == 'student':
            return StudentRequestSerializer
        elif type == 'tutor':
            return TutorRequestSerializer
        return StudentRequestSerializer

    def get_queryset(self):
        type = self.kwargs.get('type', None)
        if type == 'student':
            return StudentRequest.objects.all()
        elif type == 'tutor':
            return TutorRequest.objects.all()
        else:
            StudentRequest.objects.all()


class UserBelongsToMatch(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        type = self.kwargs.get('type', None)
        if type == 'student':
            return obj.student_request.user == request.user
        elif type == 'tutor':
            return obj.tutor_request.user == request.user
        else:
            return False


class AccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        type = view.kwargs.get('type', None)
        if type == 'student':
            if hasattr(request.user, 'studentdata'):
                return True
        elif type == 'tutor':
            if hasattr(request.user, 'tutordata') and request.user.tutordata.verified:
                return True
        return type is None


class RequestView(MatchUserMixin, MatchTypeMixin, generics.CreateAPIView, generics.RetrieveAPIView, generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, AccessPermission]

    def perform_create(self, serializer):
        self.get_queryset().filter(user=self.request.user).delete()
        serializer.save(user=self.request.user)


class MeetingListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeetingSerializer
    queryset = Meeting.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ended']

    def get_queryset(self):
        return self.queryset.filter(Q(student=self.request.user) | Q(tutor=self.request.user))


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
        provider = None
        receiver = None
        if meeting.student and meeting.tutor:
            if meeting.student == self.request.user:
                provider = meeting.student
                receiver = meeting.tutor
            else:
                provider = meeting.tutor
                receiver = meeting.student

        serializer.save(provider=provider, receiver=receiver)


class FeedbackDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()
    lookup_field = 'meeting'

    def get_queryset(self):
        return self.queryset.filter(Q(provider=self.request.user) | Q(receiver=self.request.user))


match_answer_param = openapi.Parameter(
    'agree', openapi.IN_BODY, 'Agree with Match?', required=True, schema=openapi.Schema(type=openapi.TYPE_BOOLEAN))

schema = openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        'agree': openapi.Schema(type=openapi.TYPE_BOOLEAN)})

type_parameter = openapi.Parameter('type', openapi.IN_PATH, description='User type',
                                   required=True, type=openapi.TYPE_STRING, enum=['student', 'tutor'], )


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
def join_meeting(request, match_uuid):
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
        return Response(data={'join_url': url})
    else:
        raise exceptions.NotFound(detail="No matching meeting found")


@api_view(['POST'])
def end_callback(request, meeting_id):
    meeting = Meeting.objects.filter(pk=meeting_id)
    if meeting:
        meeting = meeting.get()
        meeting.end_meeting()
    else:
        raise exceptions.NotFound(detail="No matching meeting found!")
