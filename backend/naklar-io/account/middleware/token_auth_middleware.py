try:
    from hmac import compare_digest
except ImportError:
    def compare_digest(a, b):
        return a == b
import logging

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from knox.auth import TokenAuthentication

logger = logging.getLogger(__name__)


@database_sync_to_async
def authenticate_user(token_auth: TokenAuthentication, token: bytes):
    return token_auth.authenticate_credentials(token)


# some reference: https://gist.github.com/rluts/22e05ed8f53f97bdd02eafdf38f3d60a#gistcomment-3440304


class TokenAuthMiddleware:
    def __init__(self, app):
        self.app = app
        self.auth = TokenAuthentication()

    async def __call__(self, scope, receive, send):

        if scope.get("user") and scope.get("user").is_active():
            return await self.app(scope, receive, send)
        query = dict((x.split(b'=') for x in scope['query_string'].split(b"&")))
        if b"token" in query:
            token = query[b"token"]
            try:
                user, auth_token = await authenticate_user(self.auth, token)
            except Exception as e:
                logger.error("Couldn't authenticate user!")
                user = AnonymousUser()
        scope["user"] = user
        return await self.app(scope, receive, send)


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))
