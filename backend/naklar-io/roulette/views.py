from rest_framework import generics
from rest_framework import mixins
from rest_framework import permissions
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import TutorRequest, StudentRequest, Request, Match, Meeting
from .serializers import TutorRequestSerializer, StudentRequestSerializer, MatchSerializer


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


class RequestView(MatchTypeMixin, MatchUserMixin, generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, AccessPermission]
    """  def get_serializer_class(self):
        if 'type' in self.request.query_params:
            if self.request.query_params['type'] == 'student':
                return StudentRequestSerializer
            elif self.request.query_params['type'] == 'tutor':
                return TutorRequestSerializer
        else:
            raise exceptions.NotAcceptable()"""


class RequestCreateView(MatchUserMixin, MatchTypeMixin, generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, AccessPermission]

    def perform_create(self, serializer):
        self.get_queryset().filter(user=self.request.user).delete()
        serializer.save(user=self.request.user)


class RequestDeleteView(MatchUserMixin, MatchTypeMixin, generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, AccessPermission]


match_answer_param = openapi.Parameter(
    'agree', openapi.IN_BODY, 'Agree with Match?', required=True, schema=openapi.Schema(type=openapi.TYPE_BOOLEAN))

schema = openapi.Schema(type=openapi.TYPE_OBJECT, properties={'agree': openapi.Schema(type=openapi.TYPE_BOOLEAN)})

type_parameter = openapi.Parameter('type', openapi.IN_PATH, description='User type', required=True, type=openapi.TYPE_STRING, enum=['student', 'tutor'], )

@swagger_auto_schema(method='POST', manual_parameters=[type_parameter], request_body=schema)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def match_answer(request, uuid):
    # first, find corresponding match
    match = Match.objects.find(uuid=uuid)
    agree = request.data.get('agree', None)
    if agree is None:
        raise exceptions.ValidationError(detail="agree is missing!")

    if match:
        match = match.get()
    else:
        raise exceptions.NotFound()

    # check if user is authenticated
    if match.student_request.user == request.user:
        # user is student
        match.student_agree = agree
        if not agree:
            match.delete()

        else:
            match.save()
        return Response({'success': True})
    elif match.tutor_request.user == request.user:
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
        if match.meeting:
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
