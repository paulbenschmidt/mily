from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet,
    EventCategoryViewSet,
    EventViewSet,
    FriendshipViewSet,
    SharedTimelineViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"categories", EventCategoryViewSet, basename="eventcategory")
router.register(r"events", EventViewSet, basename="event")
router.register(r"friendships", FriendshipViewSet, basename="friendship")
router.register(r"shared-timelines", SharedTimelineViewSet, basename="sharedtimeline")

urlpatterns = [
    path("", include(router.urls)),
]
