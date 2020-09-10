
from channels.routing import ProtocolTypeRouter, URLRouter

import roulette.routing
from django.urls import include, path

socketroutes = [
    path("roulette", URLRouter(roulette.routing.urlpatterns))
]

application = ProtocolTypeRouter({
    # 'http': URLRouter(roulette.routing.urlpatterns),
    'websocket': URLRouter(socketroutes)
})

