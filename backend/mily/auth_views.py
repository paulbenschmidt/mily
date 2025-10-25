import os
import secrets

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
import resend
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .serializers import UserPrivateSerializer
from .throttling import AuthRateThrottle

from config.settings import (
    DEFAULT_FROM_EMAIL,
    SESSION_COOKIE_DOMAIN,
    SESSION_COOKIE_HTTPONLY,
    SESSION_COOKIE_SAMESITE,
    SESSION_COOKIE_SECURE,
)

ACCESS_TOKEN_EXPIRE = 60 * 60
REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60

User = get_user_model()

# Helper functions

def set_access_token_cookie(response: Response, access_token: str) -> Response:
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE,
        domain=SESSION_COOKIE_DOMAIN,
        httponly=SESSION_COOKIE_HTTPONLY,
        secure=SESSION_COOKIE_SECURE,
        samesite=SESSION_COOKIE_SAMESITE,
        path='/',
    )
    return response


def set_refresh_token_cookie(response: Response, refresh_token: str) -> Response:
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE,
        domain=SESSION_COOKIE_DOMAIN,
        httponly=SESSION_COOKIE_HTTPONLY,
        secure=SESSION_COOKIE_SECURE,
        samesite=SESSION_COOKIE_SAMESITE,
        path='/',
    )
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_view(request):
    """Create a new user account."""
    # TODO: Account for instances where user is already signed in? Basically, there is a weird behavior if I'm already
    # logged in via Admin and I try and submit a new user via the front-end. It gives me a 403 error. Should I add more
    # graceful error handling? Maybe I could just redirect to the dashboard if the user is already logged in?
    data = request.data

    # Validate required fields
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    handle = data.get('handle', '').strip().lower()

    if not all([email, password, first_name, last_name, handle]):
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
        # Create user (not logged in yet, needs email verification)
        user = User.objects.create_user(
            username=email,  # Use email as username
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            handle=handle,
            is_email_verified=False,
        )

        # Generate token and send verification email
        verification_token = generate_and_save_verification_token(user)
        send_verification_email(user, verification_token)

        return Response({
            'message': 'Account created. Please check your email to verify your account.',
            'email': email
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'error': f'Failed to create account: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_view(request):
    """Authenticate user and return JWT tokens."""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Authenticate user
    user = authenticate(request, username=email, password=password)

    if user is not None:
        if not user.is_email_verified:
            return Response({
                'error': 'Please verify your email before logging in. Check your inbox for the verification link.',
                'error_code': 'EMAIL_NOT_VERIFIED',
                'email': user.email
            }, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_active:
            # Update last login timestamp
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            serializer = UserPrivateSerializer(user)
            response = Response({
                'message': 'Login successful',
                'user': serializer.data,
            })

            # Set httpOnly cookies for tokens
            set_access_token_cookie(response, access_token)
            set_refresh_token_cookie(response, refresh_token)

            return response
        else:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthRateThrottle])
def logout_view(request):
    """Logout user by clearing httpOnly cookies."""

    response = Response({
        'message': 'Logout successful'
    })

    # Clear httpOnly cookies (must match: key, path, domain, samesite)
    response.delete_cookie(
        'access_token',
        path='/',
        domain=SESSION_COOKIE_DOMAIN,
        samesite=SESSION_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        'refresh_token',
        path='/',
        domain=SESSION_COOKIE_DOMAIN,
        samesite=SESSION_COOKIE_SAMESITE,
    )

    return response


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
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

        # Send email (in local, this will print to console)
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
            DEFAULT_FROM_EMAIL,
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


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
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


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def verify_email_view(request):
    """Verify user's email with token and return JWT tokens."""
    token = request.data.get('token')

    if not token:
        return Response({
            'error': 'Verification token is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Find user with this token
        user = User.objects.get(email_verification_token=token)

        # Check if token is expired (1 hour)
        if user.email_verification_sent_at:
            time_elapsed = timezone.now() - user.email_verification_sent_at
            if time_elapsed.total_seconds() > 3600:  # 1 hour
                return Response({
                    'error': 'Verification link has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Verify email and update last login
        user.is_email_verified = True
        user.email_verification_token = None  # Clear token after use
        user.last_login = timezone.now()
        user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        serializer = UserPrivateSerializer(user)
        response = Response({
            'message': 'Email verified successfully',
            'user': serializer.data,
        })

        # Set httpOnly cookies for tokens
        set_access_token_cookie(response, access_token)
        set_refresh_token_cookie(response, refresh_token)

        return response

    except User.DoesNotExist:
        return Response({
            'error': 'Invalid or expired verification link'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def resend_verification_email_view(request):
    """Resend verification email to user."""
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        # Check if already verified
        if user.is_email_verified:
            return Response({
                'error': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate new token and send email
        verification_token = generate_and_save_verification_token(user)
        send_verification_email(user, verification_token)

        return Response({
            'message': 'Verification email sent'
        })

    except User.DoesNotExist:
        # Don't reveal if email exists
        return Response({
            'message': 'If an account with that email exists, a verification email has been sent'
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token_view(request):
    """
    Get CSRF token for client-side requests.
    This endpoint explicitly sets the csrftoken cookie via get_token().
    Call this on app initialization to ensure CSRF token is available.
    """
    get_token(request)
    return Response({'message': 'CSRF token initialized'})


# TODO: Implement session refresh
# @require_http_methods(["POST"])
# def refresh_session(request):
#     """Extend session expiry"""
#     if request.user.is_authenticated:
#         # Extend session by updating it
#         request.session.set_expiry(86400)  # 24 hours from now
#         return JsonResponse({'success': True})

#     return JsonResponse({'authenticated': False}, status=401)


# Email Verification

def generate_and_save_verification_token(user):
    """Generate new verification token and save to user."""
    verification_token = secrets.token_urlsafe(48)  # 64-character URL-safe token
    user.email_verification_token = verification_token
    user.email_verification_sent_at = timezone.now()
    user.save()
    return verification_token


def send_verification_email(user, token):
    """Send email verification link to user."""
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = 'Verify Your Email - Mily'
    message = f"""Hi {user.first_name},

Welcome to Mily! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 1 hour.

If you didn't create an account, please ignore this email.

Thanks,
The Mily Team
"""

    api_key = os.getenv('RESEND_API_KEY')
    if api_key and api_key != '':
        try:
            resend.api_key = api_key # Use HTTPS for production (since SMTP is blocked by Railway)
            email = resend.Emails.send({
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": [user.email],
                "subject": subject,
                "text": message,
            })
            print(f"Verification email sent to {user.email} via Resend API")
            print(f"Resend response: {email}")
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")
            raise
    else:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )


# Custom Token Refresh View for httpOnly Cookies

class CookieTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that reads refresh token from httpOnly cookie
    and sets new access token AND new refresh token in httpOnly cookies.

    With ROTATE_REFRESH_TOKENS=True and BLACKLIST_AFTER_ROTATION=True:
    - Generates new access token
    - Generates new refresh token
    - Blacklists the old refresh token (prevents reuse attacks)
    """
    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie instead of request body
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Add refresh token to request data for parent class to process
        request.data['refresh'] = refresh_token

        try:
            # Call parent class to validate and generate new tokens
            # With ROTATE_REFRESH_TOKENS=True, this returns both 'access' and 'refresh' tokens
            response = super().post(request, *args, **kwargs)

            # Extract new tokens from response and set them as httpOnly cookies
            if response.status_code == 200:
                new_response = Response(
                    {'message': 'Tokens refreshed successfully'},
                    status=status.HTTP_200_OK
                )

                # Set new access token cookie
                if 'access' in response.data:
                    set_access_token_cookie(new_response, response.data['access'])

                # Set new refresh token cookie (token rotation)
                if 'refresh' in response.data:
                    set_refresh_token_cookie(new_response, response.data['refresh'])

                return new_response

            return response

        except (InvalidToken, TokenError) as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
