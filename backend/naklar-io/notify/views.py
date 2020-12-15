from django.utils import timezone
from rest_framework import (exceptions, generics, mixins, permissions, views,
                            viewsets)
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from notify.models import Notification, NotificationSettings
from notify.serializers import (NotificationSerializer,
                                NotificationSettingsSerializer)


class NotificationSettingsView(generics.RetrieveUpdateDestroyAPIView, generics.CreateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NotificationSettings.objects.all()

    def get_object(self):
        return get_object_or_404(self.queryset, user=self.request.user)

    def perform_create(self, serializer):
        if self.queryset.filter(user=self.request.user).exists():
            raise exceptions.ValidationError(
                "User already has notification settings, use PUT/PATCH/DELETE")
        return serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        return serializer.save(user=self.request.user)


class NotificationViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet
):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


    
    def get_queryset(self):
        return self.queryset.filter(user__pk=self.request.user.pk)


@api_view(['POST'])
def on_react(request, id):
    notification = get_object_or_404(Notification, pk=id)
    if not notification.reacted:
        notification.reacted = True
        notification.reacted_date = timezone.now()
        notification.save()
    return Response({"success": True})