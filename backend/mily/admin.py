from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Event, Share


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ('username', 'email', 'handle', 'first_name', 'last_name', 'is_active', 'is_email_verified', 'created_at')
    list_filter = ('is_staff', 'is_active', 'created_at', 'is_email_verified', 'deactivated_at')
    search_fields = ('username', 'email', 'handle', 'first_name', 'last_name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'deactivated_at')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('handle', 'profile_picture')
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
            'fields': ('notes', 'photos')
        }),
        ('Settings', {
            'fields': ('privacy_level',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    """Admin interface for Share model"""
    list_display = ('user', 'shared_with_email', 'shared_with_user', 'is_registered', 'invitation_sent_at')
    list_filter = ('invitation_sent_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'shared_with_email', 'shared_with_user__email')
    readonly_fields = ('id', 'invitation_sent_at', 'created_at', 'updated_at', 'is_registered')
    raw_id_fields = ('user', 'shared_with_user')

    fieldsets = (
        (None, {
            'fields': ('user', 'shared_with_email', 'shared_with_user')
        }),
        ('Status', {
            'fields': ('is_registered', 'invitation_sent_at')
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
