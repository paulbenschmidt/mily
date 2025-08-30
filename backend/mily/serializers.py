from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    EventCategory,
    Event,
    Friendship,
    SharedTimeline,
    EventPrivacyLevel,
    EventDatePrecision,
    FriendshipStatus,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Expose a minimal, safe subset
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "profile_picture",
            "birth_date",
            "location",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "email", "username"]


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = [
            "id",
            "name",
            "category_type",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EventSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=EventCategory.objects.filter(is_active=True), allow_null=True
    )

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
            "is_date_approximate",
            "date_precision",
            "location",
            "privacy_level",
            "photos",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_date_precision(self, value: str) -> str:
        # Ensure value is one of the enum options
        if value not in EventDatePrecision.values:
            raise serializers.ValidationError("Invalid date precision.")
        return value

    def validate_privacy_level(self, value: str) -> str:
        if value not in EventPrivacyLevel.values:
            raise serializers.ValidationError("Invalid privacy level.")
        return value


class FriendshipSerializer(serializers.ModelSerializer):
    requester = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    addressee = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

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


class SharedTimelineSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    shared_with = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = SharedTimeline
        fields = [
            "id",
            "owner",
            "shared_with",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
