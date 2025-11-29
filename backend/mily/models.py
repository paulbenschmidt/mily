import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extended user model for Mily timeline app.
    Uses Django's built-in authentication system.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    handle = models.CharField(max_length=50, unique=True, help_text="URL-friendly username handle")
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    profile_picture = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, null=True, blank=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True, help_text="When the account was marked for deletion")
    is_public = models.BooleanField(default=False, help_text="Whether the user's timeline is publicly viewable")

    # Use email as the username field for login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


# Enum classes for clearer, safer choices
class EventPrivacyLevel(models.TextChoices):
    PRIVATE = "private", "Private"
    FRIENDS = "friends", "Friends Only"
    PUBLIC = "public", "Public"
    # TODO: optional add "close friends" privacy level


class Event(models.Model):
    """
    Individual life events on a user's timeline
    """

    CATEGORY_CHOICES = [
        ('major', 'Major Life Event'),
        ('minor', 'Minor Life Event'),
        ('memory', 'Memory'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    event_date = models.DateField()
    is_day_approximate = models.BooleanField(default=False, help_text="True if day is approximate (stored as 1st of month)")
    is_month_approximate = models.BooleanField(default=False, help_text="True if month is approximate (stored as January 1st of year)")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='memory')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True) # Personal reflection notes
    location = models.CharField(max_length=200, blank=True)
    privacy_level = models.CharField(max_length=10, choices=EventPrivacyLevel.choices, default=EventPrivacyLevel.PRIVATE)
    tags = models.JSONField(default=list, blank=True)  # Store event tags as array of strings

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['-event_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'event_date']),
            models.Index(fields=['user', 'privacy_level']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.event_date} - {self.title}"

    def is_visible_to(self, viewer: "User") -> bool:
        """Returns True if this event is visible to the given viewer based on privacy settings and friendship.
        MVP logic:
        - Owners can always view their own events
        - Public events visible to anyone
        - Friends-only visible if users are friends
        """
        if viewer is None:
            return self.privacy_level == EventPrivacyLevel.PUBLIC
        if self.user_id == getattr(viewer, 'id', None):
            return True
        if self.privacy_level == EventPrivacyLevel.PUBLIC:
            return True
        if self.privacy_level == EventPrivacyLevel.FRIENDS:
            # Check if viewer has access to this user's timeline via Share
            return Share.objects.filter(
                user=self.user,
                shared_with_user=viewer
            ).exists()
        return False


class EventPhoto(models.Model):
    """
    Photos attached to timeline events.
    Stores metadata and S3 keys for photos stored in AWS S3.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_photos')
    s3_key = models.CharField(max_length=500, help_text="S3 object key (path) for the photo")
    filename = models.CharField(max_length=255, help_text="Original filename")
    content_type = models.CharField(max_length=100, help_text="MIME type (e.g., image/jpeg)")
    file_size = models.IntegerField(help_text="File size in bytes")
    # Dimensions are currently not being used but are kept in case we want to use them for gallery-style photo display
    # or for smart cropping photos to a standard size
    width = models.IntegerField(null=True, blank=True, help_text="Image width in pixels")
    height = models.IntegerField(null=True, blank=True, help_text="Image height in pixels")
    display_order = models.IntegerField(default=0, help_text="Order for displaying multiple photos")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'event_photos'
        ordering = ['display_order', 'created_at']
        indexes = [
            models.Index(fields=['event', 'display_order']),
        ]

    def __str__(self):
        return f"Photo for {self.event.title} - {self.filename}"

    def save(self, *args, **kwargs):
        """Enforce maximum number of photos per event."""
        if not self.pk:  # Only check on creation
            photo_count = EventPhoto.objects.filter(event=self.event).count()
            if photo_count >= settings.MAX_PHOTOS_PER_EVENT:
                raise ValueError(f"Maximum of {settings.MAX_PHOTOS_PER_EVENT} photos per event")
        super().save(*args, **kwargs)


class Share(models.Model):
    """
    Tracks timeline shares with friends/family via email.
    When a user shares their timeline, a Share record is created.
    If the recipient signs up, shared_with_user is populated.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timeline_shares', help_text="User who is sharing their timeline")
    shared_with_email = models.EmailField(help_text="Email address of the person who can view the timeline")
    shared_with_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shared_timelines',
        help_text="Populated when the recipient creates an account"
    )
    is_accepted = models.BooleanField(default=False, help_text="Whether the recipient has accepted the invitation")
    accepted_at = models.DateTimeField(null=True, blank=True, help_text="When the recipient accepted the invitation")
    invitation_sent_at = models.DateTimeField(auto_now_add=True, help_text="When the invitation email was sent")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shares'
        constraints = [
            models.UniqueConstraint(fields=['user', 'shared_with_email'], name='uniq_share_user_email'),
            models.CheckConstraint(check=~models.Q(user=models.F('shared_with_user')), name='prevent_self_share'),
        ]
        indexes = [
            models.Index(fields=['user', 'shared_with_email']),
            models.Index(fields=['shared_with_user']),
            models.Index(fields=['shared_with_email']),
        ]

    def __str__(self):
        return f"{self.user.email} shared with {self.shared_with_email}"

    @property
    def is_registered(self):
        """Check if the recipient has registered an account"""
        return self.shared_with_user is not None
