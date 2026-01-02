from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .aws_s3 import create_presigned_get_url, make_avatar_key
from .models import (
    Event,
    EventInvite,
    EventMention,
    EventPhoto,
    EventPrivacyLevel,
    Notification,
    Share,
)

User = get_user_model()


class BaseUserSerializer(serializers.ModelSerializer):
    """Base serializer with shared avatar URL logic."""
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = []

    def get_avatar_url(self, obj: User) -> str | None:
        """Generate presigned URL for avatar using timestamp from avatar_updated_at."""
        if not obj.avatar_updated_at:
            return None
        try:
            timestamp = int(obj.avatar_updated_at.timestamp())
            key = make_avatar_key(str(obj.id), timestamp)
            return create_presigned_get_url(key)
        except Exception:
            return None


class UserPublicSerializer(BaseUserSerializer):
    """Serializer for public user data (for user discovery)."""

    class Meta(BaseUserSerializer.Meta):
        fields = [
            "id",
            "email",
            "handle",
            "first_name",
            "last_name",
            "avatar_url",
        ]
        read_only_fields = ["id", "email"]


class UserPrivateSerializer(BaseUserSerializer):
    """Private user info for own profile access."""

    class Meta(BaseUserSerializer.Meta):
        fields = [
            "id",
            "username",
            "handle",
            "email",
            "first_name",
            "last_name",
            "avatar_url",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "email", "username"]


# Alias for backward compatibility
UserSerializer = UserPrivateSerializer


class EventPhotoSerializer(serializers.ModelSerializer):
    """Serializer for event photos with presigned URLs for viewing."""
    url = serializers.SerializerMethodField()

    class Meta:
        model = EventPhoto
        fields = [
            "id",
            "event",
            "s3_key",
            "filename",
            "content_type",
            "file_size",
            "width",
            "height",
            "display_order",
            "url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "event", "s3_key", "created_at", "updated_at", "url"]

    def get_url(self, obj: EventPhoto) -> str:
        """Generate presigned URL for viewing the photo."""
        try:
            return create_presigned_get_url(obj.s3_key)
        except Exception:
            return ""


class EventMentionSerializer(serializers.ModelSerializer):
    """Serializer for event mentions/tags."""
    event = serializers.PrimaryKeyRelatedField(read_only=True)
    mentioned_user = UserPublicSerializer(read_only=True)

    class Meta:
        model = EventMention
        fields = [
            "id",
            "event",
            "mentioned_user",
            "source",
            "created_at",
        ]
        read_only_fields = ["id", "event", "mentioned_user", "created_at"]


class EventSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    photos = EventPhotoSerializer(many=True, read_only=True)
    mentions = EventMentionSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "user",
            "category",
            "title",
            "description",
            "notes",
            "event_date",
            "is_day_approximate",
            "is_month_approximate",
            "location",
            "privacy_level",
            "photos",
            "mentions",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "photos", "mentions"]

    def validate_privacy_level(self, value: str) -> str:
        if value not in EventPrivacyLevel.values:
            raise serializers.ValidationError("Invalid privacy level.")
        return value


class EventPublicSerializer(serializers.ModelSerializer):
    """Serializer for public event data (excludes personal notes and mentions)."""
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    photos = EventPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "user",
            "category",
            "title",
            "description",
            "event_date",
            "is_day_approximate",
            "is_month_approximate",
            "location",
            "privacy_level",
            "photos",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "photos"]

    def validate_privacy_level(self, value: str) -> str:
        if value not in EventPrivacyLevel.values:
            raise serializers.ValidationError("Invalid privacy level.")
        return value


class EventInviteSerializer(serializers.ModelSerializer):
    """Serializer for event invitations."""
    event = EventPublicSerializer(read_only=True)
    recipient = UserPublicSerializer(read_only=True)

    class Meta:
        model = EventInvite
        fields = [
            "id",
            "event",
            "recipient",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "event", "recipient", "created_at", "updated_at"]


class ShareSerializer(serializers.ModelSerializer):
    """Serializer for timeline shares with full user information."""
    user = UserPublicSerializer(read_only=True)
    shared_with_user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Share
        fields = [
            "id",
            "user",
            "shared_with_email",
            "shared_with_user",
            "is_accepted",
            "accepted_at",
            "invitation_sent_at",
        ]
        read_only_fields = ["id", "user", "shared_with_user", "accepted_at", "invitation_sent_at"]

    def validate_shared_with_email(self, value: str) -> str:
        """Validate email format and prevent self-sharing."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if value.lower() == request.user.email.lower():
                raise serializers.ValidationError("You cannot share your timeline with yourself.")
        return value.lower()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications."""

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "read_at",
            "action_url",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "action_url",
            "created_at",
        ]
