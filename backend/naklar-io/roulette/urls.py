from django.urls import path, re_path, include
from . import views
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

type_parameter = openapi.Parameter('type', openapi.IN_PATH, description='User type', required=True, type=openapi.TYPE_STRING, enum=['student', 'tutor'])
app_name = 'roulette'

typed_patterns = [
    path('request/', swagger_auto_schema(manual_parameters=[type_parameter], method='GET')(views.RequestView.as_view())),
    path('request/delete/', swagger_auto_schema(manual_parameters=[type_parameter], method='DELETE')(views.RequestDeleteView.as_view())),
    path('request/create/', swagger_auto_schema(manual_parameters=[type_parameter], method='POST')(views.RequestCreateView.as_view())),
    path('match/answer/<uuid:uuid>/', views.match_answer),
]


urlpatterns = [
    path('meeting/join/<uuid:match_uuid>/', views.join_meeting),
    re_path(r'^(?P<type>(student|tutor))/', include(typed_patterns)),
]

