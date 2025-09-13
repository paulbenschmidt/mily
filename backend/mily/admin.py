from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Event, Friendship


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ('username', 'email', 'handle', 'first_name', 'last_name', 'created_at')
    list_filter = ('is_staff', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'handle', 'first_name', 'last_name')
    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('handle', 'profile_picture', 'birth_date', 'location')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for Event model"""
    list_display = ('title', 'user', 'category', 'event_date', 'created_at')
    list_filter = ('category', 'privacy_level', 'created_at')
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
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    """Admin interface for Friendship model"""
    list_display = ('requester', 'addressee', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__username', 'addressee__username')
    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('requester', 'addressee', 'status')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
