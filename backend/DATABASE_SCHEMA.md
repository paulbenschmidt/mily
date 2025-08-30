# Mily Database Schema

TODO: Update this document to reflect the actual database schema.

## Overview
This document describes the database schema for the Mily personal timeline application. The schema supports core features including timeline creation, event categorization, friend relationships, and timeline sharing.

## Models

### User
Extended Django user model with Clerk integration for authentication.

**Key Fields:**
- `clerk_user_id`: Integration with Clerk authentication
- `bio`: User biography (max 500 chars)
- `profile_picture`: URL to profile image
- `birth_date`: User's birth date
- `is_profile_public`: Privacy setting for profile visibility

### EventCategory
Categorizes life events into Major, Minor, and Other types.

**Key Fields:**
- `name`: Category name (unique)
- `category_type`: One of 'major', 'minor', 'other'
- `color_hex`: Display color for UI
- `icon`: Icon class name for visual representation

### Event
Individual life events on a user's timeline.

**Key Features:**
- Flexible date precision (day/month/year)
- Privacy levels (private/friends/public)
- Rich content support (notes, photos)
- Location tracking
- Category association

**Privacy Levels:**
- `private`: Only visible to event owner
- `friends`: Visible to friends
- `public`: Visible to everyone

### Friendship
Manages friend relationships between users.

**Status Flow:**
1. `pending`: Friend request sent
2. `accepted`: Friends confirmed
3. `declined`: Request rejected
4. `blocked`: User blocked

**Key Methods:**
- `are_friends()`: Class method to check friendship status

### SharedTimeline
Controls timeline sharing between users with granular permissions.

**Features:**
- Date range filtering
- Category filtering
- Permission levels (view/comment)
- Expiration dates
- Active/inactive status

**Permission Levels:**
- `view`: Read-only access
- `comment`: Can view and add comments

### TimelineComment
Comments on shared timeline events (future feature).

**Key Fields:**
- Links to SharedTimeline and specific Event
- Content with 500 character limit
- Commenter tracking

## Relationships

```
User (1) ----< (M) Event
User (1) ----< (M) Friendship (as requester)
User (1) ----< (M) Friendship (as addressee)
User (1) ----< (M) SharedTimeline (as owner)
User (1) ----< (M) SharedTimeline (as shared_with)
User (1) ----< (M) TimelineComment

EventCategory (1) ----< (M) Event
EventCategory (M) ----< (M) SharedTimeline (included_categories)

Event (1) ----< (M) TimelineComment
SharedTimeline (1) ----< (M) TimelineComment
```

## Indexes

Performance indexes are created on:
- `Event`: user + event_date, user + privacy_level, category
- `Friendship`: requester + status, addressee + status
- `SharedTimeline`: owner + is_active, shared_with + is_active
- `TimelineComment`: shared_timeline + event, commenter

## Security Considerations

1. **Privacy Levels**: Events respect privacy settings in sharing
2. **Friend Verification**: SharedTimeline should verify friendship before sharing
3. **UUID Primary Keys**: All models use UUID for security
4. **Clerk Integration**: Authentication handled by Clerk service

## Future Enhancements

1. **Event Reactions**: Like/react to shared events
2. **Timeline Templates**: Predefined event categories
3. **Media Management**: Enhanced photo/video support
4. **Notifications**: Friend requests, timeline shares, comments
5. **Event Collaboration**: Multiple users contributing to events
