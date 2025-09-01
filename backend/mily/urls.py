from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    EventViewSet,
    FriendshipViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"events", EventViewSet, basename="event")
router.register(r"friendships", FriendshipViewSet, basename="friendship")

urlpatterns = [
    path("", include(router.urls)),
]
