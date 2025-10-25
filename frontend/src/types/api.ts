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

export interface TimelineEventType {
  id: string;
  user: string;
  title: string;
  description: string;
  notes?: string;
  event_date: string;
  category: 'major' | 'minor' | 'memory';
  privacy_level: 'private' | 'friends' | 'public';
  photos?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user?: UserType;
}
