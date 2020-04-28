from django.urls import path
from drf_yasg.utils import swagger_auto_schema
from knox import views as knox_views

from account import views
from account.views import (CurrentUserView, CustomUserCreateView,
                           CustomUserView, LoginView, SchoolDataList,
                           SchoolTypeList, StateList, SubjectList,
                           UploadVerificationView)

app_name = 'account'

urlpatterns = [
    path('states/', StateList.as_view()),
    path('subjects/', SubjectList.as_view()),
    path('schooltypes/', SchoolTypeList.as_view()),
    path('schooldata/', SchoolDataList.as_view()),
    path('schooldata/<int:school_type>/', SchoolDataList.as_view()),
    path('users/<uuid:uuid>/', CustomUserView.as_view(), name="user_view"),
    path('current/', CurrentUserView.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})),
    path('create/', CustomUserCreateView.as_view()),
    path('email/verify/<uuid:token>/', views.verify_email),
    path('email/resend_verification/', views.resend_verification),
    path('request-password-reset/', views.password_reset_request),
    path('reset-password/<uuid:token>/', views.password_reset_verify),
    path('login/', LoginView.as_view(), name='knox_login'),
    path('logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]
