import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint for Railway deployment."""
    return Response({
        'status': 'healthy',
        'message': 'API is running'
    })
