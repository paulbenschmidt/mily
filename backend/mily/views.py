import logging

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Event,
    EventPrivacyLevel,
    FriendshipStatus,
)
from .serializers import (
    UserPublicSerializer,
    UserPrivateSerializer,
    EventSerializer,
)

logger = logging.getLogger(__name__)

User = get_user_model()

# Permissions

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only owners can modify; others can read if visible."""

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        # Event owner
        if isinstance(obj, Event):
            return obj.user_id == getattr(request.user, "id", None)
        return False

# ViewSets

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to user profiles. Editing handled via auth-specific flows.
    MVP: expose basic user info; no write access here.
    """

    queryset = User.objects.filter(is_active=True).order_by("username")
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request, *args, **kwargs):
        """Get current authenticated user's profile."""
        serializer = UserPrivateSerializer(request.user)
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user if self.request and self.request.user.is_authenticated else None
        qs = Event.objects.select_related("user")
        # If authenticated, show own events plus others visible based on privacy
        if user:
            return qs.filter(
                Q(user=user)
                | Q(privacy_level=EventPrivacyLevel.PUBLIC)
                | (
                    Q(privacy_level=EventPrivacyLevel.FRIENDS)
                    & (
                        Q(user__sent_friend_requests__addressee=user, user__sent_friend_requests__status=FriendshipStatus.ACCEPTED)
                        | Q(user__received_friend_requests__requester=user, user__received_friend_requests__status=FriendshipStatus.ACCEPTED)
                    )
                )
            ).distinct()
        # Anonymous users: only public events
        return qs.filter(privacy_level=EventPrivacyLevel.PUBLIC)

    def perform_create(self, serializer: EventSerializer) -> None:
        """Only allow current user to create events for themselves."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="self")
    def self_events(self, request):
        """Get current user's timeline events ordered by date."""
        logger.info("Self events requested by user: %s", request.user)
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        events = Event.objects.filter(user=request.user).order_by('event_date')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
