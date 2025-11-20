from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Event,
    EventPrivacyLevel,
    Share,
)

User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer for public user data (for user discovery)."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "handle",
            "first_name",
            "last_name",
            "profile_picture",
        ]
        read_only_fields = ["id", "username"]


class UserPrivateSerializer(serializers.ModelSerializer):
    """Private user info for own profile access."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "handle",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "email", "username"]


# Alias for backward compatibility
UserSerializer = UserPrivateSerializer


class EventSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

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
            "location",
            "privacy_level",
            "photos",
            "tags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_privacy_level(self, value: str) -> str:
        if value not in EventPrivacyLevel.values:
            raise serializers.ValidationError("Invalid privacy level.")
        return value


class ShareSerializer(serializers.ModelSerializer):
    """Serializer for timeline shares. Only exposes minimal public information."""

    class Meta:
        model = Share
        fields = [
            "id",
            "shared_with_email",
            "invitation_sent_at",
        ]
        read_only_fields = ["id", "invitation_sent_at"]

    def validate_shared_with_email(self, value: str) -> str:
        """Validate email format and prevent self-sharing."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if value.lower() == request.user.email.lower():
                raise serializers.ValidationError("You cannot share your timeline with yourself.")
        return value.lower()
