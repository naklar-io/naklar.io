from django.urls import path

from knox import views as knox_views

from account.views import StateList, SubjectList, CustomUserView,\
        CurrentUserView, SchoolTypeList, SchoolDataList
from account.views import LoginView, CustomUserCreateView, UploadVerificationView
from account import views

from drf_yasg.utils import swagger_auto_schema

app_name = 'account'

urlpatterns = [
    path('states/', StateList.as_view()),
    path('subjects/', SubjectList.as_view()),
    path('schooltypes/', SchoolTypeList.as_view()),
    path('schooldata/', SchoolDataList.as_view()),
    path('schooldata/<int:school_type>/', SchoolDataList.as_view()),
    path('users/<uuid:uuid>/', CustomUserView.as_view(), name="user_view"),
    path('current/', CurrentUserView.as_view()),
    path('create/', CustomUserCreateView.as_view()),
    path('upload_verification/', views.UploadVerificationView.as_view()),
    path('delete_verification/', views.DeleteVerificationView.as_view()),
    path(r'login/', LoginView.as_view(), name='knox_login'),
    path(r'logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]
