from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    EventViewSet,
    NotificationViewSet,
    ShareViewSet,
    get_other_timeline,
)
from .auth_views import (
    register_view,
    login_view,
    logout_view,
    password_reset_request_view,
    password_reset_confirm_view,
    change_password_view,
    verify_email_view,
    resend_verification_email_view,
    get_csrf_token_view,
    CookieTokenRefreshView,
)
from .helper_views import health_check
from .throttling import TokenRefreshRateThrottle

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"events", EventViewSet, basename="event")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"shares", ShareViewSet, basename="share")

urlpatterns = [
    path("", include(router.urls)),

    # Health check endpoint
    path("health/", health_check, name="health_check"),

    # Public timeline endpoint
    path("timelines/<str:handle>/", get_other_timeline, name="public_timeline"),

    # Authentication endpoints
    path("auth/csrf-token/", get_csrf_token_view, name="csrf_token"),
    path("auth/login/", login_view, name="auth_login"),
    path("auth/logout/", logout_view, name="auth_logout"),
    path("auth/change-password/", change_password_view, name="change_password"),
    path("auth/password-reset-confirm/", password_reset_confirm_view, name="password_reset_confirm"),
    path("auth/password-reset-request/", password_reset_request_view, name="password_reset_request"),
    path("auth/register/", register_view, name="auth_register"),
    path("auth/resend-verification/", resend_verification_email_view, name="resend_verification"),
    path("auth/token/refresh/",
        CookieTokenRefreshView.as_view(throttle_classes=[TokenRefreshRateThrottle]), name="token_refresh"),
    path("auth/verify-email/", verify_email_view, name="verify_email"),
]
