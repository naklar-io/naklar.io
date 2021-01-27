from channels.routing import URLRouter
from django.urls import path

import roulette.routing

socketroutes = [
    path("roulette/",
         URLRouter(roulette.routing.urlpatterns))
]
