import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Event, EventPrivacyLevel, EventType

User = get_user_model()

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=User)
def store_original_birth_date(sender, instance, **kwargs):
    """
    Store the original birth_date (to the instance) before saving to detect changes; by
    using the instance, we avoid a database query to get the original birth_date.
    """
    if instance.pk:  # Only for existing users
        try:
            original_user = User.objects.get(pk=instance.pk)
            instance._original_birth_date = original_user.birth_date
        except User.DoesNotExist:
            instance._original_birth_date = None
    else:
        instance._original_birth_date = None


@receiver(post_save, sender=User)
def manage_birthday_event(sender, instance, created, **kwargs):
    """
    Create or update birthday event when User is created or birth_date changes.
    """
    if not instance.birth_date:
        return

    # Check if this is a new user or if birth_date changed
    birth_date_changed = (
        created or
        (hasattr(instance, '_original_birth_date') and
         instance._original_birth_date != instance.birth_date)
    )

    if birth_date_changed:
        try:
            # Get or create the birthday event
            birthday_event, event_created = Event.objects.get_or_create(
                user=instance,
                type=EventType.SYSTEM_BIRTHDAY,
                defaults={
                    'title': "Born",
                    'event_date': instance.birth_date,
                    'category': 'major',
                    'privacy_level': EventPrivacyLevel.PRIVATE,
                    'is_editable': False,
                    'description': f"Born on {instance.birth_date.strftime('%B %d, %Y')}",
                }
            )

            # If the event already exists but birth_date changed, update it
            if not event_created and hasattr(instance, '_original_birth_date'):
                birthday_event.event_date = instance.birth_date
                birthday_event.description = f"Born on {instance.birth_date.strftime('%B %d, %Y')}"
                birthday_event.save()

        except Exception as e:
            # Log the error but don't break user creation
            logger.error(f"Error creating birthday event for user {instance.email}: {str(e)}")
