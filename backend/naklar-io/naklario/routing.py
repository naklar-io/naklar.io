
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import roulette.routing
from django.urls import include, path
from account.middleware.token_auth_middleware import TokenAuthMiddleware

socketroutes = [
    path("roulette",
         URLRouter(roulette.routing.urlpatterns))
]

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': TokenAuthMiddleware(URLRouter(socketroutes))
})
