"""
Django management command to create sample events for testing timeline functionality.
Usage: python manage.py create_sample_events
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from mily.models import User, Event, EventPrivacyLevel
import random


class Command(BaseCommand):
    help = 'Creates sample events for a test user spanning ~40 years'

    def handle(self, *args, **options):
        # Get the test user
        user_id = '77b6ff3c-d9e5-4bfb-bf59-6b234061ed91'
        user_email = 'testing.mily@gmail.com'

        try:
            user = User.objects.get(id=user_id, email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with id {user_id} and email {user_email} not found'))
            return

        # Calculate date range (35 years ago to today)
        end_date = date.today()
        start_date = end_date - timedelta(days=35*365)

        self.stdout.write(f'Creating events for {user.email} from {start_date} to {end_date}')

        # Sample events data
        major_events_data = [
            # Major Life Events
            {'category': 'major', 'title': 'Born', 'description': 'The beginning of my journey', 'location': 'Boston, MA'},
            {'category': 'major', 'title': 'Started Elementary School', 'description': 'First day of kindergarten', 'location': 'Boston, MA'},
            {'category': 'major', 'title': 'Learned to Ride a Bike', 'description': 'Finally did it without training wheels!', 'location': 'Local Park'},
            {'category': 'major', 'title': 'Started Middle School', 'description': 'New school, new friends', 'location': 'Boston, MA'},
            {'category': 'major', 'title': 'First Job - Paper Route', 'description': 'Started delivering newspapers every morning', 'location': 'Neighborhood'},
            {'category': 'major', 'title': 'Started High School', 'description': 'Freshman year begins', 'location': 'Boston, MA'},
            {'category': 'major', 'title': 'Got Driver\'s License', 'description': 'Passed on the first try!', 'location': 'DMV'},
            {'category': 'major', 'title': 'Graduated High School', 'description': 'End of an era, ready for college', 'location': 'Boston, MA'},
            {'category': 'major', 'title': 'Started College', 'description': 'First day at university', 'location': 'Ann Arbor, MI'},
            {'category': 'major', 'title': 'Study Abroad in Spain', 'description': 'Semester in Barcelona', 'location': 'Barcelona, Spain'},
            {'category': 'major', 'title': 'Graduated College', 'description': 'Bachelor\'s degree in Computer Science', 'location': 'Ann Arbor, MI'},
            {'category': 'major', 'title': 'First Full-Time Job', 'description': 'Started as a software engineer', 'location': 'San Francisco, CA'},
            {'category': 'major', 'title': 'Moved to San Francisco', 'description': 'Big move across the country', 'location': 'San Francisco, CA'},
            {'category': 'major', 'title': 'Promotion to Senior Engineer', 'description': 'Hard work paying off', 'location': 'San Francisco, CA'},
            {'category': 'major', 'title': 'Bought First Home', 'description': 'Finally a homeowner!', 'location': 'Oakland, CA'},
            {'category': 'major', 'title': 'Started Own Company', 'description': 'Took the leap into entrepreneurship', 'location': 'San Francisco, CA'},
            {'category': 'major', 'title': 'Got Married', 'description': 'Best day of my life', 'location': 'Napa Valley, CA'},
        ]

        minor_events_data = [
            # Minor Life Events
            {'category': 'minor', 'title': 'Joined Soccer Team', 'description': 'Started playing competitive soccer', 'location': 'Boston, MA'},
            {'category': 'minor', 'title': 'First Concert', 'description': 'Saw my favorite band live', 'location': 'Boston, MA'},
            {'category': 'minor', 'title': 'Won Science Fair', 'description': 'First place in regional competition', 'location': 'Boston, MA'},
            {'category': 'minor', 'title': 'Summer Camp Counselor', 'description': 'Great summer working with kids', 'location': 'Lake Tahoe, CA'},
            {'category': 'minor', 'title': 'Learned to Play Guitar', 'description': 'Started taking lessons', 'location': 'Boston, MA'},
            {'category': 'minor', 'title': 'First Apartment', 'description': 'Moved out of dorms into my own place', 'location': 'Ann Arbor, MI'},
            {'category': 'minor', 'title': 'Internship at Tech Startup', 'description': 'Summer internship experience', 'location': 'San Francisco, CA'},
            {'category': 'minor', 'title': 'Ran First Marathon', 'description': 'Completed in 4 hours 15 minutes', 'location': 'Chicago, IL'},
            {'category': 'minor', 'title': 'Adopted a Dog', 'description': 'Rescued a golden retriever named Max', 'location': 'San Francisco, CA'},
            {'category': 'minor', 'title': 'Started Photography Hobby', 'description': 'Bought my first DSLR camera', 'location': 'San Francisco, CA'},
            {'category': 'minor', 'title': 'Learned to Surf', 'description': 'Finally caught my first wave', 'location': 'Santa Cruz, CA'},
            {'category': 'minor', 'title': 'Completed Coding Bootcamp', 'description': 'Intensive 3-month program', 'location': 'San Francisco, CA'},
            {'category': 'minor', 'title': 'Started Volunteering', 'description': 'Weekly volunteer at local food bank', 'location': 'Oakland, CA'},
            {'category': 'minor', 'title': 'Joined Book Club', 'description': 'Monthly meetings with neighbors', 'location': 'Oakland, CA'},
        ]

        memory_events_data = [
            # Memories
            {'category': 'memory', 'title': 'Family Vacation to Disney', 'description': 'Amazing week with the family', 'location': 'Orlando, FL'},
            {'category': 'memory', 'title': 'First Snowboarding Trip', 'description': 'Fell down a lot but had fun', 'location': 'Tahoe, CA'},
            {'category': 'memory', 'title': 'Road Trip with Friends', 'description': 'Epic cross-country adventure', 'location': 'Route 66'},
            {'category': 'memory', 'title': 'Camping in Yosemite', 'description': 'Incredible views and hiking', 'location': 'Yosemite, CA'},
            {'category': 'memory', 'title': 'Surprise Birthday Party', 'description': 'Friends threw me an amazing party', 'location': 'San Francisco, CA'},
            {'category': 'memory', 'title': 'Cooking Class in Italy', 'description': 'Learned to make authentic pasta', 'location': 'Rome, Italy'},
            {'category': 'memory', 'title': 'Skydiving Experience', 'description': 'Terrifying but exhilarating', 'location': 'San Diego, CA'},
            {'category': 'memory', 'title': 'Wine Tasting Weekend', 'description': 'Explored Napa vineyards', 'location': 'Napa, CA'},
            {'category': 'memory', 'title': 'Attended Music Festival', 'description': 'Three days of amazing performances', 'location': 'Coachella, CA'},
            {'category': 'memory', 'title': 'Hiking Half Dome', 'description': 'Challenging but worth it', 'location': 'Yosemite, CA'},
            {'category': 'memory', 'title': 'New Year\'s in NYC', 'description': 'Times Square countdown', 'location': 'New York, NY'},
            {'category': 'memory', 'title': 'Beach Bonfire Party', 'description': 'Perfect summer evening', 'location': 'Santa Cruz, CA'},
            {'category': 'memory', 'title': 'First Time Seeing Snow', 'description': 'Magical winter experience', 'location': 'Vermont'},
            {'category': 'memory', 'title': 'Karaoke Night', 'description': 'Embarrassing but fun performance', 'location': 'San Francisco, CA'},
            {'category': 'memory', 'title': 'Farmers Market Sundays', 'description': 'Started weekly tradition', 'location': 'Oakland, CA'},
            {'category': 'memory', 'title': 'Game Night with Friends', 'description': 'Monthly board game gatherings', 'location': 'Oakland, CA'},
            {'category': 'memory', 'title': 'Sunset Picnic', 'description': 'Beautiful evening at the park', 'location': 'Golden Gate Park, CA'},
            {'category': 'memory', 'title': 'Coffee Shop Discovery', 'description': 'Found my new favorite spot', 'location': 'San Francisco, CA'},
            {'category': 'memory', 'title': 'Art Gallery Opening', 'description': 'Friend\'s first exhibition', 'location': 'San Francisco, CA'},
        ]

        # Distribute events across 40 years
        total_days = (end_date - start_date).days
        events_created = 0

        for event_group in [major_events_data, minor_events_data, memory_events_data]:
            for i, event_data in enumerate(event_group):
                # Distribute events somewhat evenly but with some randomness
                days_offset = int((i / len(event_group)) * total_days) + random.randint(-30, 30)
                days_offset = max(0, min(days_offset, total_days))  # Keep within bounds
                event_date = start_date + timedelta(days=days_offset)

                # Randomize privacy levels
                privacy_choices = [
                    EventPrivacyLevel.PRIVATE,
                    EventPrivacyLevel.FRIENDS,
                    EventPrivacyLevel.PUBLIC,
                ]
                privacy_level = random.choice(privacy_choices)

                # Create the event
                Event.objects.create(
                    user=user,
                    event_date=event_date,
                    category=event_data['category'],
                    title=event_data['title'],
                    description=event_data.get('description', ''),
                    location=event_data.get('location', ''),
                    privacy_level=privacy_level,
                    notes=f"Sample note for {event_data['title']}" if random.random() > 0.5 else '',
                    # tags=['sample', event_data['category']] if random.random() > 0.7 else [],
                )
                events_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {events_created} events for {user.email}'
            )
        )

        # Show summary
        major_count = Event.objects.filter(user=user, category='major').count()
        minor_count = Event.objects.filter(user=user, category='minor').count()
        memory_count = Event.objects.filter(user=user, category='memory').count()

        self.stdout.write(f'\nEvent Summary:')
        self.stdout.write(f'  Major: {major_count}')
        self.stdout.write(f'  Minor: {minor_count}')
        self.stdout.write(f'  Memory: {memory_count}')
        self.stdout.write(f'  Total: {events_created}')
