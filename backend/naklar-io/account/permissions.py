from rest_framework import permissions


class IsUser(permissions.BasePermission):
    """
    Custom permission to only allow users to edit/view their own account
    """
    def has_object_permission(self, request, view, obj):
        return obj == request.user
