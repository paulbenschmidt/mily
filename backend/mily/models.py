import uuid

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
    birth_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the username field for login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'birth_date']

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


class EventType(models.TextChoices):
    USER = "user", "User Created"
    SYSTEM_BIRTHDAY = "system_birthday", "System Birthday"


class FriendshipStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Declined"
    BLOCKED = "blocked", "Blocked"


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
    is_date_approximate = models.BooleanField(default=False)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='memory')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True) # Personal reflection notes
    location = models.CharField(max_length=200, blank=True)
    privacy_level = models.CharField(max_length=10, choices=EventPrivacyLevel.choices, default=EventPrivacyLevel.PRIVATE)
    photos = models.JSONField(default=list, blank=True)  # Store photo URLs/metadata
    tags = models.JSONField(default=list, blank=True)  # Store event tags as array of strings
    is_editable = models.BooleanField(default=False, help_text="Whether this event can be edited by the user. False for system-generated events.")
    type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.USER)

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
        db_table = 'friendships'
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
