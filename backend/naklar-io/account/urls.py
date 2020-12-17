from django.urls import path
from drf_yasg.utils import swagger_auto_schema
from knox import views as knox_views
from rest_framework.routers import DefaultRouter

from account import views
from account.views import (CurrentUserView, CustomUserCreateView,
                           CustomUserView, LoginView, SchoolDataList,
                           SchoolTypeList, StateList,
                           UploadVerificationView, send_tracking_deny, SubjectViewSet)

app_name = 'account'
router = DefaultRouter()
router.register('subjects', SubjectViewSet)
urlpatterns = router.urls
urlpatterns += [
    path('states/', StateList.as_view()),
    path('schooltypes/', SchoolTypeList.as_view()),
    path('schooldata/', SchoolDataList.as_view()),
    path('schooldata/<int:school_type>/', SchoolDataList.as_view()),
    path('users/<uuid:uuid>/', CustomUserView.as_view(), name="user_view"),
    path('current/', CurrentUserView.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="account_view"),
    path('create/', CustomUserCreateView.as_view(), name="account_create"),
    path('email/verify/<uuid:token>/', views.verify_email, name="email_verify"),
    path('email/resend_verification/', views.resend_verification),
    path('request-password-reset/', views.password_reset_request),
    path('reset-password/<uuid:token>/', views.password_reset_verify),
    path('login/', LoginView.as_view(), name='knox_login'),
    path('logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('count-tracking-deny/', send_tracking_deny, name='count_tracking_deny')
]
