/**
 * API Types
 *
 * This file contains TypeScript interfaces for API data structures.
 * These will be candidates for DRY optimization with OpenAPI schema generation.
 */

export interface UserType {
  id: string;
  username: string;
  handle: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES = ['major', 'minor', 'memory'] as const;
export type EventCategory = typeof EVENT_CATEGORIES[number];
export const EVENT_PRIVACY_LEVELS = ['private', 'friends', 'public'] as const;
export type EventPrivacyLevel = typeof EVENT_PRIVACY_LEVELS[number];

export interface TimelineEventType {
  id: string;
  user: string;
  title: string;
  description: string;
  notes?: string;
  event_date: string;
  category: EventCategory;
  privacy_level: EventPrivacyLevel;
  photos?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user?: UserType;
}
