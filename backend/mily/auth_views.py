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

from .models import Share
from .serializers import UserPrivateSerializer
from .throttling import AuthRateThrottle


User = get_user_model()

# Helper functions

def set_access_token_cookie(response: Response, access_token: str) -> Response:
    response.set_cookie(
        key='access_token',
        value=access_token,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
        httponly=settings.SIMPLE_JWT['COOKIE_HTTPONLY'],
        secure=settings.SIMPLE_JWT['COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
        path='/',
    )
    return response


def set_refresh_token_cookie(response: Response, refresh_token: str) -> Response:
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
        httponly=settings.SIMPLE_JWT['COOKIE_HTTPONLY'],
        secure=settings.SIMPLE_JWT['COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
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

        # Send notification to paul@mily.bio about new signup
        send_new_user_notification(user)

        # Update any pending shares with this email to link to the new user
        # Note: We only link the user, we don't auto-accept. User must explicitly accept.
        pending_shares = Share.objects.filter(
            shared_with_email=email,
            shared_with_user__isnull=True
        )
        pending_shares.update(shared_with_user=user)

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
            # Update last login and last active timestamps
            now = timezone.now()
            user.last_login = now
            user.last_active = now
            user.save(update_fields=['last_login', 'last_active'])

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
        domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
        samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
    )
    response.delete_cookie(
        'refresh_token',
        path='/',
        domain=settings.SIMPLE_JWT['COOKIE_DOMAIN'],
        samesite=settings.SIMPLE_JWT['COOKIE_SAMESITE'],
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

        # Verify email and update last login and last active
        now = timezone.now()
        user.is_email_verified = True
        user.email_verification_token = None  # Clear token after use
        user.last_login = now
        user.last_active = now
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AuthRateThrottle])
def change_password_view(request):
    """Change password for authenticated user."""
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if not current_password or not new_password:
        return Response({
            'error': 'Current password and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({
            'error': 'New password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = request.user

    # Verify current password
    if not user.check_password(current_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if new password is same as current
    if current_password == new_password:
        return Response({
            'error': 'New password must be different from current password'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Set new password
        user.set_password(new_password)
        user.save()

        # Send notification email
        send_password_change_notification(user)

        return Response({
            'message': 'Password changed successfully'
        })

    except Exception as e:
        return Response({
            'error': f'Failed to change password: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


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

    # Plain text version (fallback)
    text_message = f"""Hi {user.first_name},

Welcome to Mily! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 1 hour.

If you didn't create an account, you can safely ignore this email.

Thanks,
Paul from Mily
"""

    # HTML version with styled button
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi {user.first_name},</p>

        <p>Welcome to Mily! Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_url}"
               style="display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                Verify Email Address
            </a>
        </div>

        <p>Or copy and paste this link into your browser:</p>

        <p style="word-break: break-all; color: #666;">{verification_url}</p>

        <p>This link will expire in 1 hour.</p>

        <p>If you didn't create an account, you can safely ignore this email.</p>

        <p>Thanks,<br>Paul from Mily</p>
    </body>
    </html>
    """

    api_key = os.getenv('RESEND_API_KEY')
    if api_key and api_key != '':
        try:
            resend.api_key = api_key # Use HTTPS for production (since SMTP is blocked by Railway)
            email = resend.Emails.send({
                "from": f"Mily <{settings.DEFAULT_FROM_EMAIL}>",
                "to": [user.email],
                "subject": subject,
                "text": text_message,
                "html": html_message,
            })
            print(f"Verification email sent to {user.email} via Resend API")
            print(f"Resend response: {email}")
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")
            raise
    else:
        from django.core.mail import EmailMultiAlternatives

        email = EmailMultiAlternatives(
            subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)


def send_new_user_notification(user):
    """Send notification to paul@mily.bio when a new user signs up."""
    subject = f'New User Signup: {user.first_name} {user.last_name}'

    text_message = f"""New user signed up on Mily:

Name: {user.first_name} {user.last_name}
Email: {user.email}
Handle: @{user.handle}
Signup Time: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S UTC')}

Reach out to learn what made them sign up and how they heard about Mily!
"""

    api_key = os.getenv('RESEND_API_KEY')
    if api_key and api_key != '':
        try:
            resend.api_key = api_key
            email = resend.Emails.send({
                "from": f"Mily <{settings.DEFAULT_FROM_EMAIL}>",
                "to": ["paul@mily.bio"],
                "subject": subject,
                "text": text_message,
            })
        except Exception as e:
            # Don't fail the signup if notification email fails
            print(f"Failed to send new user notification: {e}")


def send_account_deactivation_notification(user):
    """Send notification to paul@mily.bio when a user deactivates their account."""
    subject = f'Account Deactivated: {user.first_name} {user.last_name}'

    text_message = f"""A user has deactivated their account on Mily:

Name: {user.first_name} {user.last_name}
Email: {user.email}
Handle: @{user.handle}
Account Created: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S UTC')}
Deactivated: {user.deactivated_at.strftime('%Y-%m-%d %H:%M:%S UTC') if user.deactivated_at else 'Unknown'}

Consider reaching out to understand why they left.
"""

    api_key = os.getenv('RESEND_API_KEY')
    if api_key and api_key != '':
        try:
            resend.api_key = api_key
            email = resend.Emails.send({
                "from": f"Mily <{settings.DEFAULT_FROM_EMAIL}>",
                "to": ["paul@mily.bio"],
                "subject": subject,
                "text": text_message,
            })
        except Exception as e:
            # Don't fail the deactivation if notification email fails
            print(f"Failed to send account deactivation notification: {e}")


def send_password_change_notification(user):
    """Send notification email to user when their password is changed."""
    subject = 'Your Mily Password Has Been Changed'

    # Plain text version
    text_message = f"""Hi {user.first_name},

Your Mily account password was recently changed.

If you made this change, you can safely ignore this email.

If you did not make this change, please contact us immediately at paul@mily.bio to secure your account.

Thanks,
Paul from Mily
"""

    # HTML version
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hi {user.first_name},</p>

        <p>Your Mily account password was recently changed.</p>

        <p>If you made this change, you can safely ignore this email.</p>

        <p><strong>If you did not make this change</strong>, please contact us immediately at <a href="mailto:paul@mily.bio">paul@mily.bio</a> to secure your account.</p>

        <p>Thanks,<br>Paul from Mily</p>
    </body>
    </html>
    """

    api_key = os.getenv('RESEND_API_KEY')
    if api_key and api_key != '':
        try:
            resend.api_key = api_key
            email = resend.Emails.send({
                "from": f"Mily <noreply@mily.bio>",
                "to": [user.email],
                "subject": subject,
                "text": text_message,
                "html": html_message,
            })
            print(f"Password change notification sent to {user.email}")
        except Exception as e:
            print(f"Failed to send password change notification: {e}")
            # Don't fail the password change if email fails
    else:
        from django.core.mail import EmailMultiAlternatives

        email = EmailMultiAlternatives(
            subject,
            text_message,
            'noreply@mily.bio',
            [user.email],
        )
        email.attach_alternative(html_message, "text/html")
        try:
            email.send(fail_silently=False)
        except Exception as e:
            print(f"Failed to send password change notification: {e}")


# Custom Token Refresh View for httpOnly Cookies
# Uses class-based view instead of function-based view to extend TokenRefreshView
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
                # Update user's last_active timestamp
                if request.user and request.user.is_authenticated:
                    request.user.last_active = timezone.now()
                    request.user.save(update_fields=['last_active'])

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
