from channels.routing import ProtocolTypeRouter, URLRouter
import roulette.routing

application = ProtocolTypeRouter({
    'http': URLRouter(roulette.routing.urlpatterns),
})