import os
import logging
import secrets

from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
import resend
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import UserPrivateSerializer

from config.settings import (
    SESSION_COOKIE_AGE,
    SESSION_COOKIE_HTTPONLY,
    SESSION_COOKIE_SAMESITE,
    SESSION_COOKIE_SECURE,
)


User = get_user_model()

@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([AllowAny])
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


@ensure_csrf_cookie
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
        if not user.is_email_verified:
            return Response({
                'error': 'Please verify your email before logging in. Check your inbox for the verification link.',
                'error_code': 'EMAIL_NOT_VERIFIED',
                'email': user.email
            }, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_active:
            login(request, user) # Critical for cookies to be set as part of the session data

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
                max_age=SESSION_COOKIE_AGE,  # 24 hours
                httponly=SESSION_COOKIE_HTTPONLY,  # Allow JS access for debugging
                secure=SESSION_COOKIE_SECURE,    # HTTP for localhost
                samesite=SESSION_COOKIE_SAMESITE
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


@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout user and destroy session."""
    try:
        logout(request)

        # Ensure session is completely destroyed
        if hasattr(request, 'session'):
            request.session.flush()  # More thorough than just logout()

        return Response({
            'message': 'Logout successful'
        })
    except Exception as e:
        logging.error(f"Logout failed: {str(e)}")
        return Response({
            'error': 'Logout failed on server'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ensure_csrf_cookie
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


@ensure_csrf_cookie
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


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status_view(request):
    """Check if user is authenticated."""

    # # Comprehensive debug logging (9/18/2025: helpful for diagnosing the cookie issue)
    # print("=" * 50)
    # print("AUTH STATUS CHECK - DETAILED LOGGING")
    # print(f"Request method: {request.method}")
    # print(f"Request path: {request.path}")
    # print(f"Request headers: {dict(request.headers)}")
    # print(f"Request cookies: {request.COOKIES}")
    # print(f"Session key: {request.session.session_key}")
    # print(f"Session data: {dict(request.session)}")
    # print(f"User: {request.user}")
    # print(f"User type: {type(request.user)}")
    # print(f"Is authenticated: {request.user.is_authenticated}")
    # print(f"Is anonymous: {request.user.is_anonymous}")
    # if hasattr(request.user, 'id'):
    #     print(f"User ID: {request.user.id}")
    # print("=" * 50)

    if request.user.is_authenticated:
        serializer = UserPrivateSerializer(request.user)
        response = Response({
            'authenticated': True,
            'user': serializer.data
        })
        logging.info("User authenticated successfully")
        return response
    else:
        logging.info("User not authenticated")
        return Response({
            'authenticated': False
        })


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token_view(request):
    """
    Using the @ensure_csrf_cookie decorator, this view forces Django to set the CSRF cookie in
    the response. This can be useful prior to making a POST request to ensure the user is
    authenticated or that the request isn't being made by a malicious user who initiates the
    request from an untrusted source.
    """
    return Response({
        'message': 'CSRF token set in cookie'
    })


@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    """Verify user's email with token."""
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

        # Verify email
        user.is_email_verified = True
        user.email_verification_token = None  # Clear token after use
        user.save()

        # Log the user in
        login(request, user)

        serializer = UserPrivateSerializer(user)
        response = Response({
            'message': 'Email verified successfully',
            'user': serializer.data
        })

        # Set session cookie
        response.set_cookie(
            'sessionid',
            request.session.session_key,
            max_age=SESSION_COOKIE_AGE,
            httponly=SESSION_COOKIE_HTTPONLY,
            secure=SESSION_COOKIE_SECURE,
            samesite=SESSION_COOKIE_SAMESITE
        )

        return response

    except User.DoesNotExist:
        return Response({
            'error': 'Invalid or expired verification link'
        }, status=status.HTTP_400_BAD_REQUEST)


@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([AllowAny])
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
