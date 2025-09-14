# Mily API Schema

## Overview
This document describes the API schema for the Mily personal timeline application MVP.

## Endpoints

```
POST   /api/auth/register/               # Register new user
POST   /api/auth/login/                  # Login user
POST   /api/auth/logout/                 # Logout user
GET    /api/auth/status/                 # Check authentication status
POST   /api/auth/password_reset_request/ # Request password reset
POST   /api/auth/password_reset_confirm/ # Confirm password reset

GET    /api/events/                      # List user's events
POST   /api/events/                      # Create new event
GET    /api/events/{id}/                 # Get single event -- this may not be needed
PUT    /api/events/{id}/                 # Update event -- this can be ignored for now
DELETE /api/events/{id}/                 # Delete event -- this can be ignored for now

GET    /api/users/                       # User profile
PUT    /api/users/                       # Update profile
```
