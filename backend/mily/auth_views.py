from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import UserPrivateSerializer

from config.settings import (
    SESSION_COOKIE_AGE,
    SESSION_COOKIE_HTTPONLY,
    SESSION_COOKIE_SECURE,
    SESSION_COOKIE_SAMESITE,
)


User = get_user_model()


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Create a new user account."""
    data = request.data

    # Validate required fields
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    handle = data.get('handle', '').strip().lower()
    birth_date = data.get('birth_date', '')

    if not all([email, password, first_name, last_name, handle, birth_date]):
        return Response({
            'error': 'Email, password, first name, last name, handle, and birth date are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response({
            'error': 'Password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'User with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if handle already exists
    if User.objects.filter(handle=handle).exists():
        return Response({
            'error': 'This handle is already taken'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create user
        user = User.objects.create_user(
            username=email,  # Use email as username
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            handle=handle,
            birth_date=birth_date,
            location=data.get('location', ''),
        )

        # Log the user in
        login(request, user)

        serializer = UserPrivateSerializer(user)
        return Response({
            'message': 'Account created successfully',
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': f'Failed to create account: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and create session."""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate user
    user = authenticate(request, username=email, password=password)

    if user is not None:
        if user.is_active:

            # Force session save to ensure session key is created
            request.session.save()

            serializer = UserPrivateSerializer(user)
            response = Response({
                'message': 'Login successful',
                'user': serializer.data
            })

            # Manually set the session cookie
            response.set_cookie(
                'sessionid',
                request.session.session_key,
                max_age=settings.SESSION_COOKIE_AGE,  # 24 hours
                httponly=settings.SESSION_COOKIE_HTTPONLY,  # Allow JS access for debugging
                secure=settings.SESSION_COOKIE_SECURE,    # HTTP for localhost
                samesite=settings.SESSION_COOKIE_SAMESITE
            )

            return response
        else:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    """Logout user and destroy session."""
    logout(request)
    return Response({
        'message': 'Logout successful'
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """Request password reset email."""
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create reset URL (you'll need to implement this on frontend)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        # Send email (in development, this will print to console)
        subject = 'Password Reset - Mily'
        message = f"""
        Hi {user.first_name or user.username},

        You requested a password reset for your Mily account.

        Click the link below to reset your password:
        {reset_url}

        If you didn't request this, please ignore this email.

        Thanks,
        The Mily Team
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response({
            'message': 'Password reset email sent'
        })

    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({
            'message': 'If an account with that email exists, a password reset email has been sent'
        })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """Confirm password reset with token."""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not all([uid, token, new_password]):
        return Response({
            'error': 'UID, token, and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({
            'error': 'Password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        # Verify token
        if default_token_generator.check_token(user, token):
            # Set new password
            user.set_password(new_password)
            user.save()

            return Response({
                'message': 'Password reset successful'
            })
        else:
            return Response({
                'error': 'Invalid or expired reset token'
            }, status=status.HTTP_400_BAD_REQUEST)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'error': 'Invalid reset link'
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def auth_status_view(request):
    """Check if user is authenticated."""
    if request.method == 'GET':
        if request.user.is_authenticated:
            serializer = UserPrivateSerializer(request.user)
            return JsonResponse({
                'authenticated': True,
                'user': serializer.data
            })
        else:
            return JsonResponse({
                'authenticated': False
            })
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
