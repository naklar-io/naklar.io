from django.conf.urls import url, include
from channels.routing import URLRouter
from channels.http import AsgiHandler
from channels.auth import AuthMiddlewareStack
#import django_eventstream

urlpatterns = [
    url(r'', AsgiHandler),
]