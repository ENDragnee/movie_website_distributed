import os
from types import SimpleNamespace
import jwt
from rest_framework import authentication, exceptions


class JWTAuthentication(authentication.BaseAuthentication):
    """
    Simple JWT authentication that uses a shared JWT_SECRET env var.

    Expects tokens with a claim containing the user's id (user_id or sub).
    """

    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'bearer':
            return None
        if len(auth) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')

        token = auth[1]
        try:
            secret = os.environ.get('JWT_SECRET')
            if not secret:
                raise exceptions.AuthenticationFailed('JWT secret not configured')
            payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id') or payload.get('sub') or payload.get('id')
        if not user_id:
            raise exceptions.AuthenticationFailed('user_id not found in token')

        user = SimpleNamespace(id=str(user_id))
        return (user, token)
