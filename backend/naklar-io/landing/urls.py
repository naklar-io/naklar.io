from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from landing import views

urlpatterns = [
    path('add_individual/', views.IndividialAdd.as_view()),
]
