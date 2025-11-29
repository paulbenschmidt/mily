import logging
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
import resend
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .aws_s3 import make_event_photo_key, create_presigned_put_url, delete_photo_from_s3
from .models import (
    Event,
    EventPhoto,
    Share,
)
from .serializers import (
    EventSerializer,
    EventPhotoSerializer,
    EventPublicSerializer,
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
    - List: Authenticated users see only their own events
    - Create: Authenticated users can create their own events
    - Retrieve/Update/Delete: Event owners can modify their own events

    Note: Viewing other users' timelines is handled by get_other_timeline()
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        Filter events to only return the authenticated user's own events.

        This ensures users cannot access other users' events through this ViewSet.
        Viewing other users' timelines is handled by the get_other_timeline() function
        which implements proper privacy filtering.
        """
        user = self.request.user

        if not user.is_authenticated:
            return Event.objects.none()

        # Only return the authenticated user's events
        return Event.objects.filter(user=user).order_by('-event_date')

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

        events = Event.objects.filter(user=request.user)
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
            # Delete associated photos from S3 before deleting the event
            for photo in instance.event_photos.all():
                try:
                    delete_photo_from_s3(photo.s3_key)
                    logger.info("Deleted photo from S3: %s", photo.s3_key)
                except Exception as e:
                    logger.error("Failed to delete photo from S3 (%s): %s", photo.s3_key, str(e))
                    # Continue with event deletion even if S3 deletion fails

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

    # NOTE: the `events/<ID>/photos/<ETC>` path is reserved for photo edits (to avoid URL clashes)
    @action(detail=True, methods=["post"], url_path="get-photo-upload-url")
    def get_photo_upload_url(self, request, pk=None):
        """
        Generate a presigned URL for uploading a photo to S3.

        Request body:
        {
            "filename": "photo.jpg",
            "content_type": "image/jpeg",
            "file_size": 1024000
        }

        Response:
        {
            "upload_url": "https://...",
            "photo_id": "uuid",
            "s3_key": "users/.../events/.../uuid.jpg"
        }
        """
        event = self.get_object()

        # Validate request data
        filename = request.data.get("filename")
        content_type = request.data.get("content_type")
        file_size = request.data.get("file_size")
        width = request.data.get("width")
        height = request.data.get("height")

        if not all([filename, content_type, file_size]):
            return Response(
                {"error": "filename, content_type, and file_size are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate content type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if content_type not in allowed_types:
            return Response(
                {"error": f"Invalid content type. Allowed: {', '.join(allowed_types)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return Response(
                {"error": f"File size exceeds maximum of {max_size / 1024 / 1024}MB"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate photo count limit (max 3 photos per event)
        current_photo_count = event.event_photos.count()
        if current_photo_count >= 3:
            return Response(
                {"error": "Maximum of 3 photos per event. Please delete a photo before adding a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Generate S3 key
            s3_key = make_event_photo_key(
                str(event.user_id),
                str(event.id),
                filename
            )

            # Create photo record
            photo = EventPhoto.objects.create(
                event=event,
                s3_key=s3_key,
                filename=filename,
                content_type=content_type,
                file_size=file_size,
                display_order=event.event_photos.count(),
                width=width,
                height=height
            )

            # Generate presigned URL
            upload_url = create_presigned_put_url(s3_key, content_type)

            logger.info("Generated upload URL for event %s, photo %s", event.id, photo.id)

            return Response({
                "upload_url": upload_url,
                "photo_id": str(photo.id),
                "s3_key": s3_key
            })

        except Exception as e:
            logger.error("Error generating upload URL: %s", str(e))
            return Response(
                {"error": "Failed to generate upload URL", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["patch", "delete"], url_path="photos/(?P<photo_id>[^/.]+)")
    def manage_photo(self, request, pk=None, photo_id=None):
        """
        Manage a photo: update metadata (PATCH) or delete (DELETE).

        PATCH - Update photo metadata:
        {
            "display_order": 0,
            "width": 1920,
            "height": 1080
        }

        DELETE - Delete photo from database and S3.
        """
        event = self.get_object()

        try:
            photo = EventPhoto.objects.get(id=photo_id, event=event)
        except EventPhoto.DoesNotExist:
            return Response(
                {"error": "Photo not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "PATCH":
            # Update allowed fields
            if "display_order" in request.data:
                photo.display_order = request.data["display_order"]
            if "width" in request.data:
                photo.width = request.data["width"]
            if "height" in request.data:
                photo.height = request.data["height"]

            photo.save()

            serializer = EventPhotoSerializer(photo)
            return Response(serializer.data)

        elif request.method == "DELETE":
            s3_key = photo.s3_key

            try:
                # Delete from S3
                delete_photo_from_s3(s3_key)
                logger.info("Deleted photo from S3: %s", s3_key)
            except Exception as e:
                logger.error("Failed to delete photo from S3 (%s): %s", s3_key, str(e))
                # Continue with database deletion even if S3 deletion fails

            # Delete from database
            photo.delete()
            logger.info("Deleted photo %s from event %s", photo_id, event.id)

            return Response(
                {"success": True, "message": "Photo deleted successfully"},
                status=status.HTTP_200_OK
            )


class ShareViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing timeline shares.
    Users can share their timeline with others via email.
    """
    serializer_class = ShareSerializer
    permission_classes = [permissions.IsAuthenticated]
    # TODO: Add pagination to handle large numbers of shares
    pagination_class = None  # Disable pagination - shares are unlikely to be numerous

    def get_queryset(self):
        """Users can only see their own shares (timelines they are sharing with others)."""
        return Share.objects.filter(user=self.request.user).select_related('shared_with_user')

    def get_object(self):
        """
        Override to allow recipients to access shares for accept/reject actions.
        Returns the share if user is either the sender or receiver (default behavior limits to sender)
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        share_id = self.kwargs[lookup_url_kwarg]

        # Query for shares where user is either the sharer OR the recipient
        obj = Share.objects.filter(
            Q(id=share_id) & (Q(user=self.request.user) | Q(shared_with_user=self.request.user))
        ).select_related('user', 'shared_with_user').first()

        if not obj:
            raise NotFound("Share not found or you don't have permission to access it.")

        return obj

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

    @action(detail=True, methods=['patch'], url_path='accept')
    def accept_invitation(self, request, pk=None):
        """
        Accept a timeline share invitation.
        Only the recipient can accept.
        """
        share = self.get_object()

        # Verify the current user is the recipient
        if share.shared_with_user != request.user:
            return Response(
                {'detail': 'You do not have permission to accept this invitation.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Accept the invitation
        share.is_accepted = True
        share.accepted_at = timezone.now()
        share.save()

        logger.info(f"Share invitation accepted: {request.user.email} accepted invitation from {share.user.email}")

        serializer = self.get_serializer(share)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='reject')
    def reject_invitation(self, request, pk=None):
        """
        Reject a timeline share invitation by deleting it.
        Only the recipient can reject.
        """
        share = self.get_object()

        # Verify the current user is the recipient
        if share.shared_with_user != request.user:
            return Response(
                {'detail': 'You do not have permission to reject this invitation.'},
                status=status.HTTP_403_FORBIDDEN
            )

        logger.info(f"Share invitation rejected: {request.user.email} rejected invitation from {share.user.email}")

        share.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
            f"Timeline share created: {self.request.user.email} shared with {shared_with_email} "
            f"(registered: {share.is_registered})"
        )

        return share

    def _send_invitation_email(self, share: Share):
        """Send invitation email to the recipient using Resend."""
        sender_name = f"{share.user.first_name} {share.user.last_name}".strip() or share.user.email
        recipient_email = share.shared_with_email

        # Determine if recipient has an account
        has_account = share.is_registered

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
The Mily Team"""

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

        <p>Thanks,<br>The Mily Team</p>
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
                logger.info(f"Invitation email sent to {recipient_email} via Resend (ID: {email.get('id')})")
            except Exception as e:
                logger.error(f"Failed to send invitation email to {recipient_email} via Resend: {str(e)}")
                # Don't fail the request if email fails
                pass
        else:
            logger.warning(f"RESEND_API_KEY not configured, skipping invitation email to {recipient_email}")


@api_view(['GET'])
@permission_classes([AllowAny])
def get_other_timeline(request, handle):
    """
    Get a user's timeline by handle with privacy-aware filtering.

    Access rules (in order of priority):
    1. If viewer IS authenticated and is the owner: Return PUBLIC + FRIENDS events
    2. If viewer IS authenticated and has accepted share: Return PUBLIC + FRIENDS events
    3. If user.is_public = True: Return all PUBLIC events (no auth required)
    4. Otherwise: Return 404
    """
    User = get_user_model()

    # Get the timeline owner
    try:
        timeline_owner = User.objects.get(handle=handle, is_active=True)
    except User.DoesNotExist:
        raise NotFound("Timeline not found")

    # Priority 1: Check if authenticated user is the owner
    if request.user.is_authenticated:

        if request.user == timeline_owner:
            # User is the owner - return all events
            events = Event.objects.filter(
                user=timeline_owner,
                privacy_level__in=['public', 'friends']
            )

            serializer = EventPublicSerializer(events, many=True)
            return Response({
                'events': serializer.data,
                'user': {
                    'first_name': timeline_owner.first_name,
                    'last_name': timeline_owner.last_name,
                    'handle': timeline_owner.handle,
                    'profile_picture': timeline_owner.profile_picture or '',
                }
            })

        # Priority 2: Check if viewer has accepted share
        has_accepted_share = Share.objects.filter(
            user=timeline_owner,
            shared_with_user=request.user,
            is_accepted=True
        ).exists()

        if has_accepted_share:
            # User has accepted share - return PUBLIC + FRIENDS events
            events = Event.objects.filter(
                user=timeline_owner,
                privacy_level__in=['public', 'friends']
            )

            serializer = EventPublicSerializer(events, many=True)
            return Response({
                'events': serializer.data,
                'user': {
                    'first_name': timeline_owner.first_name,
                    'last_name': timeline_owner.last_name,
                    'handle': timeline_owner.handle,
                    'profile_picture': timeline_owner.profile_picture or '',
                }
            })

    # Priority 3: Check if timeline is public
    if timeline_owner.is_public:
        # Public timeline - return only PUBLIC events
        events = Event.objects.filter(
            user=timeline_owner,
            privacy_level='public'
        )

        serializer = EventPublicSerializer(events, many=True)
        return Response({
            'events': serializer.data,
            'user': {
                'first_name': timeline_owner.first_name,
                'last_name': '', # Don't expose last name for public timelines
                'handle': timeline_owner.handle,
                'profile_picture': timeline_owner.profile_picture or '',
            }
        })

    # Priority 4: No access - return 404
    raise NotFound("Timeline not found")
