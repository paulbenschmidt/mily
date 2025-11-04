# Django Management Commands

This directory contains custom Django management commands for the Mily application.

## create_sample_events

Creates 50 sample timeline events for a test user, spanning approximately 35 years.

### Usage

```bash
# From the backend directory
cd /Users/paulschmidt/Documents/personal/projects/mily/backend

# Run the command
poetry run python manage.py create_sample_events
```

### What It Does

- **Target User**: `testing.mily@gmail.com` (ID: `77b6ff3c-d9e5-4bfb-bf59-6b234061ed91`)
- **Creates 50 Events**:
  - 17 Major Life Events (birth, graduations, career milestones, marriage, etc.)
  - 14 Minor Life Events (hobbies, sports, volunteering, etc.)
  - 19 Memories (vacations, trips, experiences, etc.)
- **Date Range**: Distributed across ~35 years (from 1990 to present)
- **Privacy Levels**: Randomly assigned (private/friends/public)
- **Includes**: Titles, descriptions, locations, and notes
