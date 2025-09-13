from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    EventViewSet,
    FriendshipViewSet,
)
from .auth_views import (
    signup_view,
    login_view,
    logout_view,
    password_reset_view,
    password_reset_confirm_view,
    auth_status_view,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"events", EventViewSet, basename="event")
router.register(r"friendships", FriendshipViewSet, basename="friendship")

urlpatterns = [
    path("", include(router.urls)),
    # Authentication endpoints
    path("auth/signup/", signup_view, name="auth_signup"),
    path("auth/login/", login_view, name="auth_login"),
    path("auth/logout/", logout_view, name="auth_logout"),
    path("auth/password-reset/", password_reset_view, name="password_reset_request"),
    path("auth/password-reset-confirm/", password_reset_confirm_view, name="password_reset_confirm"),
    path("auth/status/", auth_status_view, name="auth_status"),
]
