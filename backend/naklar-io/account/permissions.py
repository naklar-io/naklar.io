from django.conf import settings
from rest_framework import permissions


class IsUser(permissions.BasePermission):
    """
    Custom permission to only allow users to edit/view their own account
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_student()


class HasAvailableAccessCodeOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if settings.NAKLAR_USE_ACCESS_CODES and request.user.is_student():
            from account.models import AccessCode
            if request.method in permissions.SAFE_METHODS:
                return True
            else:
                return AccessCode.available_codes.filter(user=request.user).count() > 0
        else:
            return True
