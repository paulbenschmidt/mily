import logging
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
import resend
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Event,
    Share,
)
from .serializers import (
    EventSerializer,
    UserPublicSerializer,
    UserPrivateSerializer,
    ShareSerializer,
)
from .throttling import (
    EventCreateRateThrottle,
    EventModifyRateThrottle,
    UserReadRateThrottle,
)
from .auth_views import send_account_deactivation_notification

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

    @action(detail=False, methods=["get", "patch", "delete"], url_path="me")
    def me(self, request, *args, **kwargs):
        """Get, update, or delete current authenticated user's profile."""
        if request.method == "PATCH":
            # Update user profile
            serializer = UserPrivateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.method == "DELETE":
            # Soft delete by setting is_active to False
            user = request.user
            user.is_active = False
            user.deactivated_at = timezone.now()
            user.save()

            logger.info(f"User account deactivated: {user.email} (ID: {user.id})")

            # Send notification to paul@mily.bio about account deactivation
            send_account_deactivation_notification(user)

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


class ShareViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing timeline shares.
    Users can share their timeline with others via email.
    """
    serializer_class = ShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own shares (timelines they are sharing with others)."""
        return Share.objects.filter(user=self.request.user).select_related('shared_with_user')

    @action(detail=False, methods=['get'], url_path='shared-with-me')
    def shared_with_me(self, request):
        """
        Get timelines that have been shared with the current user.
        Returns shares where the current user is the recipient.
        """
        shares = Share.objects.filter(
            shared_with_user=request.user
        ).select_related('user').order_by('-invitation_sent_at')

        serializer = self.get_serializer(shares, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create share and send invitation email."""
        # Check if recipient already has an account
        shared_with_email = serializer.validated_data['shared_with_email']
        shared_with_user = User.objects.filter(email=shared_with_email, is_active=True).first()

        # Create the share
        share = serializer.save(
            user=self.request.user,
            shared_with_user=shared_with_user
        )

        # Send invitation email
        self._send_invitation_email(share)

        logger.info(
            "Timeline share created: %s shared with %s (registered: %s)",
            self.request.user.email,
            shared_with_email,
            shared_with_user is not None
        )

        return share

    def _send_invitation_email(self, share: Share):
        """Send invitation email to the recipient using Resend."""
        sender_name = f"{share.user.first_name} {share.user.last_name}".strip() or share.user.email
        recipient_email = share.shared_with_email

        # Determine if recipient has an account
        has_account = share.shared_with_user is not None

        # Build the timeline URL
        timeline_url = f"{settings.FRONTEND_URL}/timeline/{share.user.handle}"

        if has_account:
            # Email for existing users
            subject = f"{sender_name} shared their timeline with you on Mily"

            text_message = f"""Hi there!

{sender_name} has shared their timeline with you on Mily.

You can view their timeline here:
{timeline_url}

Log in to your Mily account to see their life events and memories.

Thanks,
Paul from Mily"""

            html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi there!</p>

        <p><strong>{sender_name}</strong> has shared their timeline with you on Mily.</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{timeline_url}"
               style="display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                View Timeline
            </a>
        </div>

        <p>Or copy and paste this link into your browser:</p>

        <p style="word-break: break-all; color: #666;">{timeline_url}</p>

        <p>Log in to your Mily account to see their life events and memories.</p>

        <p>Thanks,<br>Paul from Mily</p>
    </body>
    </html>
            """
        else:
            # Email for new users
            signup_url = f"{settings.FRONTEND_URL}/signup?email={recipient_email}"
            subject = f"{sender_name} invited you to view their timeline on Mily"

            text_message = f"""Hi there!

{sender_name} has shared their timeline with you on Mily - a platform for creating and sharing life timelines.

To view their timeline, you'll need to create a free account:
{signup_url}

After signing up, you'll be able to see their life events and memories.

What is Mily?
Mily helps people understand themselves and life better by encouraging self-reflection through a visually engaging timeline of life events. You can also create your own timeline and share it with friends and family.

Thanks,
The Mily team"""

            html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi there!</p>

        <p><strong>{sender_name}</strong> has shared their timeline with you on Mily - a platform for creating and sharing life timelines.</p>

        <p>To view their timeline, you'll need to create a free account:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{signup_url}"
               style="display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                Sign Up & View Timeline
            </a>
        </div>

        <p>Or copy and paste this link into your browser:</p>

        <p style="word-break: break-all; color: #666;">{signup_url}</p>

        <p>After signing up, you'll be able to see their life events and memories.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-weight: 500; margin-bottom: 8px;">What is Mily?</p>
            <p style="color: #666;">Mily helps people understand themselves and life better by encouraging self-reflection through a visually engaging timeline of life events. You can also create your own timeline and share it with friends and family.</p>
        </div>

        <p>Thanks,<br>The Mily team</p>
    </body>
    </html>
            """

        # Send email using Resend
        api_key = os.getenv('RESEND_API_KEY')
        if api_key and api_key != '':
            try:
                resend.api_key = api_key
                email = resend.Emails.send({
                    "from": f"Mily <noreply@mily.bio>",
                    "to": [recipient_email],
                    "subject": subject,
                    "text": text_message,
                    "html": html_message,
                })
                logger.info("Invitation email sent to %s via Resend (ID: %s)", recipient_email, email.get('id'))
            except Exception as e:
                logger.error("Failed to send invitation email to %s via Resend: %s", recipient_email, str(e))
                # Don't fail the request if email fails
                pass
        else:
            logger.warning("RESEND_API_KEY not configured, skipping invitation email to %s", recipient_email)
