from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from . import views

type_parameter = openapi.Parameter('type', openapi.IN_PATH, description='User type',
                                   required=True, type=openapi.TYPE_STRING, enum=['student', 'tutor'])
app_name = 'roulette'

typed_patterns = [
    path('request/', swagger_auto_schema(manual_parameters=[type_parameter], methods=[
         'POST', 'DELETE', 'GET'])(views.RequestView.as_view())),
    #path('request/delete/', swagger_auto_schema(manual_parameters=[type_parameter], method='DELETE')(views.RequestDeleteView.as_view())),
    #path('request/create/', swagger_auto_schema(manual_parameters=[type_parameter], method='POST')(views.RequestCreateView.as_view())),
    path('match/answer/<uuid:uuid>/', views.match_answer),
    path('answer/match/<uuid:uuid>/', views.match_answer),
    path('answer/request/<int:id>/', views.answer_request)
]


urlpatterns = [
    path('meeting/join/<uuid:match_uuid>/', views.join_meeting),
    path('meetings/', views.MeetingListView.as_view()),
    path('meeting/feedback/', views.FeedbackListView.as_view()),
    path('meeting/feedback/<uuid:meeting>',
         views.FeedbackDetailView.as_view()),
    path('meeting/end/<uuid:meeting>/', views.end_callback),
    path('meeting/report/', views.ReportListView.as_view()),
    re_path(r'^(?P<type>(student|tutor))/', include(typed_patterns)),
]
