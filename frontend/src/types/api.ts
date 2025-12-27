/**
 * API Types
 *
 * This file contains TypeScript interfaces for API data structures.
 * These will be candidates for DRY optimization with OpenAPI schema generation.
 */

export interface UserType {
  id: string;
  handle: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES = ['major', 'minor', 'memory'] as const;
export type EventCategory = typeof EVENT_CATEGORIES[number];
export const EVENT_PRIVACY_LEVELS = ['public', 'friends', 'private'] as const;
export type EventPrivacyLevel = typeof EVENT_PRIVACY_LEVELS[number];

export interface EventPhotoType {
  id: string;
  event: string;
  s3_key: string;
  filename: string;
  content_type: string;
  file_size: number;
  width?: number;
  height?: number;
  display_order: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEventType {
  id: string;
  user: string;
  title: string;
  description: string;
  notes?: string;
  event_date: string;
  is_day_approximate: boolean;
  is_month_approximate: boolean;
  category: EventCategory;
  privacy_level: EventPrivacyLevel;
  event_photos?: EventPhotoType[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ShareType {
  id: string;
  user: UserType;
  shared_with_email: string;
  shared_with_user: UserType | null;
  is_accepted: boolean;
  accepted_at: string | null;
  invitation_sent_at: string;
}

export interface AuthResponse {
  message: string;
  user?: UserType;
}

export const NOTIFICATION_TYPES = ['share_invitation', 'share_accepted'] as const;
export type NotificationTypeValue = typeof NOTIFICATION_TYPES[number];

export interface NotificationType {
  id: string;
  notification_type: NotificationTypeValue;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  related_user: UserType | null;
  action_url: string;
  created_at: string;
}
