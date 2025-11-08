import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Event,
    EventPrivacyLevel,
    FriendshipStatus,
)
from .serializers import (
    EventSerializer,
    UserPublicSerializer,
    UserPrivateSerializer,
)
from .throttling import (
    EventCreateRateThrottle,
    EventModifyRateThrottle,
    UserReadRateThrottle,
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
    throttle_classes = [UserReadRateThrottle]

    @action(detail=False, methods=["get", "delete"], url_path="me")
    def me(self, request, *args, **kwargs):
        """Get or delete current authenticated user's profile."""
        if request.method == "DELETE":
            # Soft delete by setting is_active to False
            user = request.user
            user.is_active = False
            user.deactivated_at = timezone.now()
            user.save()

            logger.info(f"User account deactivated: {user.email} (ID: {user.id})")

            response = Response({
                'message': 'Account successfully deleted'
            })

            # Clear httpOnly cookies (must match: key, path, domain, samesite)
            response.delete_cookie(
                'access_token',
                path='/',
                domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
                samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
            )
            response.delete_cookie(
                'refresh_token',
                path='/',
                domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
                samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
            )

            return response

        # GET request
        serializer = UserPrivateSerializer(request.user)
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    """API endpoint for managing timeline events.

    Supports CRUD operations with appropriate permissions:
    - List: Authenticated users see their own events plus public/friend events
    - Create: Authenticated users can create their own events
    - Retrieve/Update/Delete: Event owners can modify their own events
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_throttles(self):
        """Apply different throttles based on action."""
        if self.action == 'create':
            return [EventCreateRateThrottle()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [EventModifyRateThrottle()]
        return super().get_throttles()

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
        logger.info("Creating new event for user: %s", self.request.user)
        try:
            event = serializer.save(user=self.request.user)
            logger.info("Event created successfully: %s", event.id)
            return event
        except Exception as e:
            logger.error("Error creating event: %s", str(e))
            raise

    @action(detail=False, methods=["get"], url_path="self")
    def self_events(self, request):
        """Get current user's timeline events ordered by date."""
        logger.info("Self events requested by user: %s", request.user)
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        events = Event.objects.filter(user=request.user).order_by('event_date')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new event with enhanced validation and error handling."""
        logger.info("Event creation request received from user: %s", request.user)

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            logger.warning("Invalid event data: %s", serializer.errors)
            return Response(
                {"error": "Invalid event data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            logger.error("Error during event creation: %s", str(e))
            return Response(
                {"error": "Failed to create event", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Delete an event with proper logging and response handling."""
        instance = self.get_object()
        event_id = instance.id
        user_id = instance.user_id

        logger.info("Deleting event %s for user %s", event_id, user_id)

        try:
            self.perform_destroy(instance)
            logger.info("Event %s successfully deleted", event_id)
            return Response(
                {"success": True, "message": "Event deleted successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error("Error deleting event %s: %s", event_id, str(e))
            return Response(
                {"error": "Failed to delete event", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
