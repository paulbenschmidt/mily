from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from django.utils import timezone
from datetime import timedelta

from .models import User, Event, EventPhoto, Share, EventMention, EventInvite


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ('username', 'email', 'handle', 'first_name', 'last_name', 'is_active', 'is_email_verified', 'created_at')
    list_filter = ('is_staff', 'is_active', 'created_at', 'is_email_verified', 'deactivated_at')
    search_fields = ('username', 'email', 'handle', 'first_name', 'last_name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'deactivated_at')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('handle', 'avatar_updated_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'email_verification_sent_at', 'deactivated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for Event model"""
    list_display = ('title', 'user', 'category', 'event_date', 'created_at')
    list_filter = ('category', 'privacy_level', 'created_at', 'user')
    search_fields = ('title', 'description', 'user__username', 'location')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'event_date'

    fieldsets = (
        (None, {
            'fields': ('user', 'category', 'title', 'description')
        }),
        ('Date & Location', {
            'fields': ('event_date', 'location')
        }),
        ('Content', {
            'fields': ('notes', 'tags')
        }),
        ('Settings', {
            'fields': ('privacy_level',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventPhoto)
class EventPhotoAdmin(admin.ModelAdmin):
    """Admin interface for EventPhoto model"""
    list_display = ('filename', 'event', 'content_type', 'file_size', 'display_order', 'created_at')
    list_filter = ('content_type', 'created_at')
    search_fields = ('filename', 'event__title', 'caption', 's3_key')
    readonly_fields = ('id', 's3_key', 'created_at', 'updated_at')
    raw_id_fields = ('event',)

    fieldsets = (
        (None, {
            'fields': ('event', 'filename', 's3_key')
        }),
        ('File Info', {
            'fields': ('content_type', 'file_size', 'width', 'height')
        }),
        ('Display', {
            'fields': ('caption', 'display_order')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    """Admin interface for Share model"""
    list_display = ('user', 'shared_with_email', 'shared_with_user', 'is_accepted', 'accepted_at', 'is_registered', 'invitation_sent_at')
    list_filter = ('is_accepted', 'invitation_sent_at', 'accepted_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'shared_with_email', 'shared_with_user__email')
    readonly_fields = ('id', 'invitation_sent_at', 'accepted_at', 'created_at', 'updated_at', 'is_registered')
    raw_id_fields = ('user', 'shared_with_user')

    fieldsets = (
        (None, {
            'fields': ('user', 'shared_with_email', 'shared_with_user')
        }),
        ('Status', {
            'fields': ('is_accepted', 'accepted_at', 'is_registered', 'invitation_sent_at')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def is_registered(self, obj):
        return obj.is_registered
    is_registered.boolean = True
    is_registered.short_description = 'Registered'


@admin.register(EventMention)
class EventMentionAdmin(admin.ModelAdmin):
    """Admin interface for EventMention model"""
    list_display = ('event', 'mentioned_user', 'source', 'created_at')
    list_filter = ('source', 'created_at')
    search_fields = ('event__title', 'mentioned_user__email', 'mentioned_user__username')
    readonly_fields = ('id', 'created_at')
    raw_id_fields = ('event', 'mentioned_user')

    fieldsets = (
        (None, {
            'fields': ('event', 'mentioned_user', 'source')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventInvite)
class EventInviteAdmin(admin.ModelAdmin):
    """Admin interface for EventInvite model"""
    list_display = ('event', 'recipient', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('event__title', 'recipient__email', 'recipient__username')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('event', 'recipient')

    fieldsets = (
        (None, {
            'fields': ('event', 'recipient', 'status')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


def get_metrics_context():
    """Calculate all metrics for the dashboard."""
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    # Exclude staff/admin users and my personal account from metrics
    regular_users = User.objects.filter(is_staff=False).exclude(email='paulbenschmidt@gmail.com')

    # New signups in last 30 days
    new_users = regular_users.filter(created_at__gte=thirty_days_ago)
    new_signups = new_users.count()

    # Activation rate: new users (last 30 days) with ≥1 event within 7 days of signup
    activated_count = 0
    for user in new_users:
        activation_window = user.created_at + timedelta(days=7)
        if Event.objects.filter(user=user, created_at__lte=activation_window).exists():
            activated_count += 1
    activation_rate = (activated_count / new_signups * 100) if new_signups > 0 else 0

    # Active users in last 30 days (created event OR added photo OR shared timeline)
    users_with_events = set(Event.objects.filter(
        created_at__gte=thirty_days_ago
    ).exclude(user__email='paulbenschmidt@gmail.com').values_list('user_id', flat=True))

    users_with_photos = set(EventPhoto.objects.filter(
        created_at__gte=thirty_days_ago
    ).exclude(event__user__email='paulbenschmidt@gmail.com').values_list('event__user_id', flat=True))

    users_with_shares = set(Share.objects.filter(
        created_at__gte=thirty_days_ago
    ).exclude(user__email='paulbenschmidt@gmail.com').values_list('user_id', flat=True))

    active_user_ids = users_with_events | users_with_photos | users_with_shares
    active_users = regular_users.filter(id__in=active_user_ids).count()

    # Total events created (last 30 days)
    events_last_30_days = Event.objects.filter(created_at__gte=thirty_days_ago).exclude(user__email='paulbenschmidt@gmail.com').count()

    # Event distribution: % of users with ≥1, ≥5, ≥10 events
    total_users = regular_users.count()
    users_with_event_counts = regular_users.annotate(
        event_count=Count('events')
    )
    users_with_1_plus = users_with_event_counts.filter(event_count__gte=1).count()
    users_with_5_plus = users_with_event_counts.filter(event_count__gte=5).count()
    users_with_10_plus = users_with_event_counts.filter(event_count__gte=10).count()

    pct_1_plus = (users_with_1_plus / total_users * 100) if total_users > 0 else 0
    pct_5_plus = (users_with_5_plus / total_users * 100) if total_users > 0 else 0
    pct_10_plus = (users_with_10_plus / total_users * 100) if total_users > 0 else 0

    # Photos uploaded in last 30 days
    photos_last_30_days = EventPhoto.objects.filter(created_at__gte=thirty_days_ago).exclude(event__user__email='paulbenschmidt@gmail.com').count()

    # Photo distribution: % of users with ≥1, ≥5, ≥10 photos
    users_with_photo_counts = regular_users.annotate(
        photo_count=Count('events__photos')
    )
    users_with_1_plus_photos = users_with_photo_counts.filter(photo_count__gte=1).count()
    users_with_5_plus_photos = users_with_photo_counts.filter(photo_count__gte=5).count()
    users_with_10_plus_photos = users_with_photo_counts.filter(photo_count__gte=10).count()

    pct_1_plus_photos = (users_with_1_plus_photos / total_users * 100) if total_users > 0 else 0
    pct_5_plus_photos = (users_with_5_plus_photos / total_users * 100) if total_users > 0 else 0
    pct_10_plus_photos = (users_with_10_plus_photos / total_users * 100) if total_users > 0 else 0

    # Shares in last 30 days
    shares_last_30_days = Share.objects.filter(created_at__gte=thirty_days_ago).exclude(user__email='paulbenschmidt@gmail.com').count()

    # % of users who've shared at least once (lifetime)
    users_who_shared = regular_users.filter(timeline_shares__isnull=False).distinct().count()
    pct_shared = (users_who_shared / total_users * 100) if total_users > 0 else 0

    return {
        'new_signups': new_signups,
        'activation_rate': round(activation_rate, 1),
        'activated_count': activated_count,
        'active_users': active_users,
        'events_last_30_days': events_last_30_days,
        'total_users': total_users,
        'users_with_1_plus': users_with_1_plus,
        'users_with_5_plus': users_with_5_plus,
        'users_with_10_plus': users_with_10_plus,
        'pct_1_plus': round(pct_1_plus, 1),
        'pct_5_plus': round(pct_5_plus, 1),
        'pct_10_plus': round(pct_10_plus, 1),
        'photos_last_30_days': photos_last_30_days,
        'users_with_1_plus_photos': users_with_1_plus_photos,
        'users_with_5_plus_photos': users_with_5_plus_photos,
        'users_with_10_plus_photos': users_with_10_plus_photos,
        'pct_1_plus_photos': round(pct_1_plus_photos, 1),
        'pct_5_plus_photos': round(pct_5_plus_photos, 1),
        'pct_10_plus_photos': round(pct_10_plus_photos, 1),
        'shares_last_30_days': shares_last_30_days,
        'users_who_shared': users_who_shared,
        'pct_shared': round(pct_shared, 1),
    }


def metrics_view(request):
    """Admin view for metrics dashboard."""
    context = {
        **admin.site.each_context(request),
        'title': 'Mily Metrics',
        'metrics': get_metrics_context(),
    }
    return TemplateResponse(request, 'admin/metrics.html', context)


admin.site.site_header = 'Mily Administration'
admin.site.site_title = 'Mily Admin'
admin.site.index_title = 'Dashboard'
