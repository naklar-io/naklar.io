
import logging

from django.utils import timezone
from rest_framework import exceptions
from rest_framework import permissions

from roulette.serializers import StudentRequestSerializer, TutorRequestSerializer
from roulette.models import StudentRequest, TutorRequest


logger = logging.getLogger(__name__)

class MatchUserMixin(object):
    """
    Matches user argument to be user
    """

    def get_object(self):
        obj = self.get_queryset().filter(user=self.request.user).filter(is_active=True)
        if obj:
            obj = obj.get()
            if hasattr(obj, 'last_poll'):
                obj.last_poll = timezone.now()
                logger.info("Updating last_poll")
                obj.save(update_fields=['last_poll'])
            return obj
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


class UserBelongsToMatchMixin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        type = self.kwargs.get('type', None)
        if type == 'student':
            return obj.student_request.user == request.user
        elif type == 'tutor':
            return obj.tutor_request.user == request.user
        else:
            return False


class AccessPermissionMixin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.email_verified:
            return False
        type = view.kwargs.get('type', None)
        if type == 'student':
            if hasattr(request.user, 'studentdata'):
                return True
        elif type == 'tutor':
            if hasattr(request.user, 'tutordata') and request.user.tutordata.verified:
                return True
        return type is None
