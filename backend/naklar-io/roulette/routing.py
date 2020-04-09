from channels.auth import AuthMiddlewareStack
from channels.http import AsgiHandler
from channels.routing import URLRouter
from django.conf.urls import include, url

#import django_eventstream

urlpatterns = [
    url(r'', AsgiHandler),
]
