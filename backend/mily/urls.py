from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet,
    EventViewSet,
)
from .auth_views import (
    register_view,
    login_view,
    logout_view,
    password_reset_request_view,
    password_reset_confirm_view,
    auth_status_view,
    verify_email_view,
    resend_verification_email_view,
)
from .helper_views import health_check

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"events", EventViewSet, basename="event")

urlpatterns = [
    path("", include(router.urls)),

    # Health check endpoint
    path("health/", health_check, name="health_check"),

    # Authentication endpoints
    path("auth/register/", register_view, name="auth_register"),
    path("auth/login/", login_view, name="auth_login"),
    path("auth/logout/", logout_view, name="auth_logout"),
    path("auth/verify-email/", verify_email_view, name="verify_email"),
    path("auth/resend-verification/", resend_verification_email_view, name="resend_verification"),
    path("auth/password-reset-request/", password_reset_request_view, name="password_reset_request"),
    path("auth/password-reset-confirm/", password_reset_confirm_view, name="password_reset_confirm"),
    path("auth/status/", auth_status_view, name="auth_status"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
