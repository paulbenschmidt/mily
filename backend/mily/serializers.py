from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Event,
    Friendship,
    EventPrivacyLevel,
    FriendshipStatus,
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
            "birth_date",
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


class FriendshipSerializer(serializers.ModelSerializer):
    requester = serializers.PrimaryKeyRelatedField(read_only=True)
    addressee = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_active=True))

    class Meta:
        model = Friendship
        fields = [
            "id",
            "requester",
            "addressee",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_status(self, value: str) -> str:
        if value not in FriendshipStatus.values:
            raise serializers.ValidationError("Invalid friendship status.")
        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        # Prevent self-friendship at serializer level too (DB constraint already handles it)
        requester = attrs.get("requester") or getattr(self.instance, "requester", None)
        addressee = attrs.get("addressee") or getattr(self.instance, "addressee", None)
        if requester and addressee and requester == addressee:
            raise serializers.ValidationError("Requester and addressee must be different users.")
        return attrs
