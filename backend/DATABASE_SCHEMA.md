# Mily Database Schema

## Overview
This document describes the database schema for the Mily personal timeline application MVP. The schema focuses on core features: user profiles, timeline events, and friend relationships.

## Models

### User
Extended Django user model with built-in authentication.

**Key Fields:**
- `id`: UUID primary key
- `username`: Unique username (inherited from AbstractUser)
- `email`: Unique email address (primary identifier)
- `first_name`: User's first name
- `last_name`: User's last name
- `profile_picture`: URL to profile image
- `is_active`: Account status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Authentication:**
- Uses built-in authentication
- Email serves as primary identifier

### Event
Individual life events on a user's timeline.

**Key Fields:**
- `id`: UUID primary key
- `user`: Foreign key to User (owner)
- `event_date`: Date of the event
- `category`: Event category ('major', 'minor', 'memory')
- `title`: Event title
- `description`: Event description (optional)
- `notes`: Personal reflection notes (optional)
- `location`: Event location (optional)
- `privacy_level`: Privacy setting ('private', 'friends', 'public')
- `photos`: JSON field for photo URLs/metadata
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Privacy Levels:**
- `private`: Only visible to event owner
- `friends`: Visible to accepted friends
- `public`: Visible to everyone

**Categories:**
- `major`: Major Life Event
- `minor`: Minor Life Event
- `memory`: Memory

### Friendship
Manages friend relationships between users.

**Key Fields:**
- `id`: UUID primary key
- `requester`: Foreign key to User (who sent the request)
- `addressee`: Foreign key to User (who received the request)
- `status`: Friendship status ('pending', 'accepted', 'declined', 'blocked')
- `created_at`: Request creation timestamp
- `updated_at`: Last status update timestamp

**Status Flow:**
1. `pending`: Friend request sent
2. `accepted`: Friends confirmed
3. `declined`: Request rejected
4. `blocked`: User blocked

**Key Methods:**
- `are_friends()`: Class method to check if two users are friends

**Database Constraints:**
- Unique constraint on (requester, addressee) pairs
- Check constraint preventing self-friendship

## Relationships

```
User (1) ----< (M) Event
User (1) ----< (M) Friendship (as requester)
User (1) ----< (M) Friendship (as addressee)
```

## Indexes

Performance indexes are created on:
- `Event`: user + event_date, user + privacy_level, user + category
- `Friendship`: requester + status, addressee + status

## API Permissions

- **Users**: Read-only access
- **Events**: Public read for public events, authenticated users can CRUD their own events
- **Friendships**: Authenticated users can manage their own friendship requests
