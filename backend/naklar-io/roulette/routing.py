from django.urls import path

from roulette import consumers

urlpatterns = [
    path("request/<str:type>/<int:request_id>", consumers.RouletteConsumer.as_asgi()),
]
