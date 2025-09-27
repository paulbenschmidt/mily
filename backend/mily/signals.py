import logging

from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)

# Signal handlers have been removed as birth_date field is no longer used
