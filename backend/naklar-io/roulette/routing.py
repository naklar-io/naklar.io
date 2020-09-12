from channels.auth import AuthMiddlewareStack
from channels.http import AsgiHandler
from channels.routing import URLRouter
from django.urls import path

from roulette import consumers

urlpatterns = [
    path("request/<str:type>/<int:request_id>", consumers.RouletteConsumer),
]
