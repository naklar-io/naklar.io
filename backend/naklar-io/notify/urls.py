from django.conf.urls import url
from django.urls import include, path
from push_notifications.api.rest_framework import \
    WebPushDeviceAuthorizedViewSet
from rest_framework.routers import DefaultRouter

from notify.views import (NotificationSettingsView, NotificationViewSet,
                          on_react)

router = DefaultRouter()
# router.register(r'device/apns', APNSDeviceAuthorizedViewSet)
# router.register(r'device/gcm', GCMDeviceAuthorizedViewSet)
router.register(r'push/device/wp', WebPushDeviceAuthorizedViewSet)
router.register(r'notification', NotificationViewSet)

urlpatterns = [
    url('', include(router.urls)),
    url(r'settings/', NotificationSettingsView.as_view()),
    path('react/<int:id>/', on_react)
]
