/**
 * API Types
 * 
 * This file contains TypeScript interfaces for API data structures.
 * These will be candidates for DRY optimization with OpenAPI schema generation.
 */

export interface User {
  id: string;
  username: string;
  handle: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  user: string;
  title: string;
  description: string;
  notes?: string;
  event_date: string;
  is_date_approximate: boolean;
  category: 'major' | 'minor' | 'memory';
  privacy_level: string;
  photos?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
}
