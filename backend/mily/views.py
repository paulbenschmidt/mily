from typing import Any

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    EventCategory,
    Event,
    Friendship,
    SharedTimeline,
    EventPrivacyLevel,
    FriendshipStatus,
)
from .serializers import (
    UserSerializer,
    EventCategorySerializer,
    EventSerializer,
    FriendshipSerializer,
    SharedTimelineSerializer,
)

User = get_user_model()


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
        # SharedTimeline owner controls the resource
        if isinstance(obj, SharedTimeline):
            return obj.owner_id == getattr(request.user, "id", None)
        return False


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to user profiles. Editing handled via auth-specific flows.
    MVP: expose basic user info; no write access here.
    """

    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class EventCategoryViewSet(viewsets.ModelViewSet):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user if self.request and self.request.user.is_authenticated else None
        qs = Event.objects.select_related("user", "category")
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

    def perform_create(self, serializer: EventSerializer) -> None:  # type: ignore[name-defined]
        serializer.save(user=self.request.user)


class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Friendship.objects.select_related("requester", "addressee")
            .filter(Q(requester=user) | Q(addressee=user))
            .order_by("-created_at")
        )

    def perform_create(self, serializer: FriendshipSerializer) -> None:  # type: ignore[name-defined]
        # Default requester to current user if not provided
        requester = serializer.validated_data.get("requester") or self.request.user
        serializer.save(requester=requester)

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        friendship: Friendship = self.get_object()
        if friendship.addressee_id != request.user.id:
            return Response({"detail": "Only the addressee can accept."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.ACCEPTED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)

    @action(detail=True, methods=["post"], url_path="decline")
    def decline(self, request, pk=None):
        friendship: Friendship = self.get_object()
        if friendship.addressee_id != request.user.id:
            return Response({"detail": "Only the addressee can decline."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.DECLINED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)

    @action(detail=True, methods=["post"], url_path="block")
    def block(self, request, pk=None):
        friendship: Friendship = self.get_object()
        # Either party can block
        if request.user.id not in (friendship.requester_id, friendship.addressee_id):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.BLOCKED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)


class SharedTimelineViewSet(viewsets.ModelViewSet):
    serializer_class = SharedTimelineSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return SharedTimeline.objects.select_related("owner", "shared_with").filter(
            Q(owner=user) | Q(shared_with=user)
        )

    def perform_create(self, serializer: SharedTimelineSerializer) -> None:  # type: ignore[name-defined]
        # Default owner to current user if not provided
        owner = serializer.validated_data.get("owner") or self.request.user
        serializer.save(owner=owner)
