"""
ASGI config for lernroulette project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETINGS_MODULE', 'naklario.settings')
django_asgi_app = get_asgi_application()

from account.middleware.token_auth_middleware import TokenAuthMiddlewareStack
from naklario.routing import socketroutes
from channels.routing import ProtocolTypeRouter, URLRouter


class PrefixURLRouter(URLRouter):
    async def __call__(self, scope, *args, **kwargs):
        script_prefix = django_asgi_app.get_script_prefix(scope)
        path = scope.get("path_remaining", scope.get("path", None))
        if path:
            new_path: str = path.removeprefix(script_prefix)
            if not new_path.startswith('/'):
                new_path = '/' + new_path
            scope["path"] = new_path
        await super(PrefixURLRouter, self).__call__(scope, *args, **kwargs)


application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': TokenAuthMiddlewareStack(PrefixURLRouter(socketroutes))
})
