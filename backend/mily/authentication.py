"""Custom authentication classes for cookie-based JWT authentication."""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that supports both cookie-based and header-based JWT auth.

    Priority:
    1. First tries to read access token from httpOnly cookies (for web browsers)
    2. Falls back to Authorization header (for mobile apps and API clients)

    This allows the same backend to serve both web and mobile clients securely.
    """

    def authenticate(self, request):
        # Try to get the access token from cookies first (web browsers)
        raw_token = request.COOKIES.get('access_token')

        # If no cookie, try the Authorization header (mobile apps)
        if raw_token is None:
            # Call parent class to check Authorization header
            header_auth = super().authenticate(request)
            if header_auth is not None:
                return header_auth
            return None

        # Validate the token from cookie (decodes, verifies signature, expiration check, blacklist check, etc.)
        validated_token = self.get_validated_token(raw_token)

        # Return the user associated with the token
        return self.get_user(validated_token), validated_token
