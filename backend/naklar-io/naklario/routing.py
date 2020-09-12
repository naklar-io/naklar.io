
from channels.routing import ProtocolTypeRouter, URLRouter

import roulette.routing
from django.urls import include, path
from account.middleware.token_auth_middleware import TokenAuthMiddlewareStack

socketroutes = [
    path("roulette",
         URLRouter(roulette.routing.urlpatterns))
]

application = ProtocolTypeRouter({
    # 'http': URLRouter(roulette.routing.urlpatterns),
    'websocket': TokenAuthMiddlewareStack(URLRouter(socketroutes))
})
