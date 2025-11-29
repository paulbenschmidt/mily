"""
AWS S3 utilities for secure photo storage.

This module provides functions for generating presigned URLs for uploading
and downloading photos from a private S3 bucket. Photos are organized by
user and event for easy management and access control.
"""
import uuid

import boto3
from django.conf import settings

# Initialize boto3 session with AWS credentials
session = boto3.session.Session(
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_DEFAULT_REGION,
)

s3_client = session.client("s3")

BUCKET_NAME = settings.AWS_S3_PHOTOS_BUCKET


def make_event_photo_key(user_id: str, event_id: str, filename: str) -> str:
    """
    Generate a unique S3 key for an event photo.

    Args:
        user_id: UUID of the user who owns the event
        event_id: UUID of the event
        filename: Original filename (used to extract extension)

    Returns:
        S3 key in format: users/{user_id}/events/{event_id}/{uuid}.{ext}
    """
    ext = (filename.rsplit(".", 1)[-1] or "").lower()
    ext = ext if ext else "jpg"
    return f"users/{user_id}/events/{event_id}/{uuid.uuid4()}.{ext}"


def create_presigned_put_url(key: str, content_type: str, expires_in: int = 600) -> str:
    """
    Generate a presigned URL for uploading a photo to S3.

    Args:
        key: S3 object key (path)
        content_type: MIME type of the file (e.g., 'image/jpeg')
        expires_in: URL expiration time in seconds (default: 10 minutes)

    Returns:
        Presigned URL string that can be used to PUT the file
    """
    return s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )


def create_presigned_get_url(key: str, expires_in: int = 900) -> str:
    """
    Generate a presigned URL for downloading a photo from S3.

    Args:
        key: S3 object key (path)
        expires_in: URL expiration time in seconds (default: 15 minutes)

    Returns:
        Presigned URL string that can be used to GET the file
    """
    return s3_client.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )


def delete_photo_from_s3(key: str) -> None:
    """
    Delete a photo from S3.

    Args:
        key: S3 object key (path) to delete
    """
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
