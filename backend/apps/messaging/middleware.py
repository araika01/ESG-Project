from urllib.parse import parse_qs
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(token):
    from django.contrib.auth import get_user_model
    from rest_framework_simplejwt.tokens import AccessToken
    User = get_user_model()
    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token['user_id'])
    except Exception:
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        if token:
            scope['user'] = await get_user(token)
        else:
            from django.contrib.auth.models import AnonymousUser
            scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)