from rest_framework import generics, mixins, permissions, views, viewsets, exceptions
from rest_framework.generics import get_object_or_404

from notify.models import NotificationSettings
from notify.serializers import NotificationSettingsSerializer

"""
Not used, as a User can only have ONE notification settings ATM, but may change in the future

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NotificationSettings.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)
"""
class NotificationSettingsView(generics.RetrieveUpdateDestroyAPIView, generics.CreateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NotificationSettings.objects.all()

    def get_object(self):
        return get_object_or_404(self.queryset, user=self.request.user)

    def perform_create(self, serializer):
        if self.queryset.filter(user=self.request.user).exists():
            raise exceptions.ValidationError("User already has notification settings, use PUT/PATCH/DELETE")
        return serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        return serializer.save(user=self.request.user)