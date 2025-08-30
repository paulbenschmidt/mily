import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """
    Extended user model for Mily timeline app.
    Uses Clerk for authentication, so we extend Django's AbstractUser.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    clerk_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username


# Enum classes for clearer, safer choices
class CategoryType(models.TextChoices):
    MAJOR = "major", "Major"
    MINOR = "minor", "Minor"
    MOMENTS = "moments", "Moments"


class EventPrivacyLevel(models.TextChoices):
    PRIVATE = "private", "Private"
    FRIENDS = "friends", "Friends Only"
    PUBLIC = "public", "Public"


class EventDatePrecision(models.TextChoices):
    DAY = "day", "Exact Day"
    MONTH = "month", "Month Only"
    YEAR = "year", "Year Only"


class FriendshipStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Declined"
    BLOCKED = "blocked", "Blocked"


class EventCategory(models.Model):
    """
    Predefined categories for organizing life events.
    Categories are managed by admins only - users select from existing categories.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    category_type = models.CharField(max_length=10, choices=CategoryType.choices)
    description = models.TextField(max_length=200, blank=True, help_text="Description shown to users when selecting category")
    is_active = models.BooleanField(default=True, help_text="Whether this category is available for selection")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Event Categories"
        ordering = ['category_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"

    @classmethod
    def get_active_categories(cls):
        """Get all active categories for user selection"""
        return cls.objects.filter(is_active=True)


class Event(models.Model):
    """
    Individual life events on a user's timeline
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    category = models.ForeignKey(EventCategory, on_delete=models.SET_NULL, null=True, related_name='events')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True) # Personal reflection notes

    # Date handling - flexible for different date precisions
    event_date = models.DateField()
    is_date_approximate = models.BooleanField(default=False)
    date_precision = models.CharField(
        max_length=10,
        choices=EventDatePrecision.choices,
        default=EventDatePrecision.DAY
    )

    # Location
    location = models.CharField(max_length=200, blank=True)

    # Privacy and sharing
    privacy_level = models.CharField(max_length=10, choices=EventPrivacyLevel.choices, default=EventPrivacyLevel.PRIVATE)

    # Media
    photos = models.JSONField(default=list, blank=True)  # Store photo URLs/metadata

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'event_date']),
            models.Index(fields=['user', 'privacy_level']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.title} - {self.event_date}"

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
            return Friendship.are_friends(self.user, viewer)
        return False


class Friendship(models.Model):
    """
    Manages friend relationships between users
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_friend_requests')
    addressee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_friend_requests')
    status = models.CharField(max_length=10, choices=FriendshipStatus.choices, default=FriendshipStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['requester', 'addressee'], name='uniq_friendship_requester_addressee'),
            models.CheckConstraint(check=~models.Q(requester=models.F('addressee')), name='prevent_self_friendship'),
        ]
        indexes = [
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['addressee', 'status']),
        ]

    def __str__(self):
        return f"{self.requester.username} -> {self.addressee.username} ({self.status})"

    @classmethod
    def are_friends(cls, user1, user2):
        """Check if two users are friends"""
        return cls.objects.filter(
            models.Q(requester=user1, addressee=user2) |
            models.Q(requester=user2, addressee=user1),
            status=FriendshipStatus.ACCEPTED
        ).exists()


class SharedTimeline(models.Model):
    """
    Manages timeline sharing between users
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_timelines')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accessible_timelines')

    # # Date range for shared events (optional - if empty, shares all events)
    # FEATURE: This could be a cool feature to add later
    # start_date = models.DateField(null=True, blank=True)
    # end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['owner', 'shared_with'], name='uniq_shared_timeline_owner_with'),
            models.CheckConstraint(check=~models.Q(owner=models.F('shared_with')), name='prevent_self_share'),
        ]

    def __str__(self):
        return f"{self.owner.username} shared timeline with {self.shared_with.username}"
