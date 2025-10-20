from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Throttle for authentication endpoints (login, signup, etc.)"""
    scope = 'auth'


class EventCreateRateThrottle(UserRateThrottle):
    """Throttle for creating events"""
    scope = 'event_create'


class EventModifyRateThrottle(UserRateThrottle):
    """Throttle for updating/deleting events"""
    scope = 'event_modify'


class TokenRefreshRateThrottle(UserRateThrottle):
    """Throttle for token refresh endpoint"""
    scope = 'token_refresh'


class UserReadRateThrottle(UserRateThrottle):
    """Throttle for reading user profiles"""
    scope = 'user_read'
