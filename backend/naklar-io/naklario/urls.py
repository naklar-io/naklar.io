"""lernroulette URL Configuration The `urlpatterns` list routes URLs to views. For more information please see: https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin

from django.urls import include, path
from django.views.generic import TemplateView

from rest_framework.schemas import get_schema_view


# change this to view API
TOKEN = "3232e8284a7ee9375b8f9d8eeb2ed297242d20c301a0d60b0f0ecbd57eae52a8"
urlpatterns = [
    path('landing/', include('landing.urls')),
    path('account/', include('account.urls')),
    path('admin/', admin.site.urls),
    path('openapi', get_schema_view(
        title='naklar.io',
        description='naklar.io - clientAPI',
        version='0.1'), name='openapi-schema'),
    path('swagger-ui/', TemplateView.as_view(
        template_name='swagger-ui.html',
        extra_context={'schema_url': 'openapi-schema',
                       'token': TOKEN},
    ), name='swagger-ui')]
