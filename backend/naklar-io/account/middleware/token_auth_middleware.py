try:
    from hmac import compare_digest
except ImportError:
    def compare_digest(a, b):
        return a == b
import binascii
import logging

from asgiref.sync import async_to_sync, sync_to_async
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from knox.auth import TokenAuthentication
from knox.crypto import hash_token
from knox.models import AuthToken, AuthTokenManager
from knox.settings import CONSTANTS, knox_settings

logger = logging.getLogger(__name__)

@database_sync_to_async
def authenticate_user(token_auth: TokenAuthentication, token: bytes):
    return token_auth.authenticate_credentials(token)


class TokenAuthMiddleware:
    """
    Custom auth middleware using rest-tokens
    """

    def __init__(self, inner):
        # Store the ASGI application we were passed
        self.inner = inner
        self.auth = TokenAuthentication()

    def __call__(self, scope):
        return TokenAuthMiddlewareInstance(scope, self)


class TokenAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.middleware = middleware
        self.scope = dict(scope)
        self.inner = self.middleware.inner

    async def __call__(self, receive, send):
        # Close old database connections to prevent usage of timed out connections
        sync_to_async(close_old_connections)()

        if self.scope.get("user") and self.scope.get("user").is_active():
            inner = self.inner(dict(self.scope), user=self.scope.get("user"))
            return await inner(receive, send)
        query = dict((x.split(b'=') for x in self.scope['query_string'].split(b"&")))
        if b"token" in query:
            token = query[b"token"]
            try: 
                user, auth_token = await authenticate_user(self.middleware.auth, token)
            except Exception as e:
                logger.error("Couldn't authenticate user!")
                user = AnonymousUser()
            # Return the inner application directly and let it run everything else
            inner = self.inner(dict(self.scope, user=user))
            return await inner(receive, send)
        inner = self.inner(dict(self.scope, user=AnonymousUser())) 
        return await inner(receive, send)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))