import os
import sys

# Add the parent directory to sys.path to make imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from mily.models import Event, EventPrivacyLevel

User = get_user_model()


class UserViewSetTestCase(APITestCase):
    """Test cases for UserViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
            handle='testuser1'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123',
            handle='testuser2'
        )
        self.inactive_user = User.objects.create_user(
            username='inactive',
            email='inactive@example.com',
            password='testpass123',
            handle='inactive',
            is_active=False
        )

    def test_list_users_requires_authentication(self):
        """Anonymous users cannot list users"""
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_users_authenticated(self):
        """Authenticated users can list active users with public fields only"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)  # Only active users

        # Check that only public fields are exposed
        for user_data in response.data["results"]:
            public_fields = {'id', 'username', 'first_name', 'last_name', 'avatar_updated_at', 'handle'}
            self.assertEqual(set(user_data.keys()), public_fields)

            # Ensure private fields are not exposed
            self.assertNotIn('email', user_data)

    def test_retrieve_user_public_fields(self):
        """Retrieving specific user returns only public fields"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-detail', kwargs={'pk': self.user2.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('email', response.data)

    def test_me_endpoint_returns_private_fields(self):
        """The /me/ endpoint returns full user data including private fields"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email', response.data)
        self.assertEqual(response.data['email'], self.user1.email)

    def test_me_endpoint_requires_authentication(self):
        """The /me/ endpoint requires authentication"""
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_users_are_read_only(self):
        """Users cannot be created, updated, or deleted via API"""
        self.client.force_authenticate(user=self.user1)

        # Test POST (create)
        url = reverse('user-list')
        response = self.client.post(url, {'username': 'newuser'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test PUT (update)
        url = reverse('user-detail', kwargs={'pk': self.user1.pk})
        response = self.client.put(url, {'username': 'updated'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test DELETE
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class EventViewSetTestCase(APITestCase):
    """Test cases for EventViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123',
            handle='user1'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123',
            handle='user2'
        )

        # Create test events
        self.public_event = Event.objects.create(
            user=self.user1,
            title='Public Event',
            event_date='2023-01-01',
            privacy_level=EventPrivacyLevel.PUBLIC
        )
        self.private_event = Event.objects.create(
            user=self.user1,
            title='Private Event',
            event_date='2023-01-02',
            privacy_level=EventPrivacyLevel.PRIVATE
        )

    def test_anonymous_users_see_only_public_events(self):
        """Anonymous users can only see public events"""
        url = reverse('event-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]['title'], 'Public Event')

    def test_authenticated_users_see_own_and_public_events(self):
        """Authenticated users see their own events plus public events"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('event-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 3)  # All user1's events

    def test_create_event_requires_authentication(self):
        """Creating events requires authentication"""
        url = reverse('event-list')
        event_data = {
            'title': 'New Event',
            'event_date': '2023-06-01',
            'category': 'memory'
        }
        response = self.client.post(url, event_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_event_sets_user_automatically(self):
        """Creating an event automatically sets the user to the authenticated user"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('event-list')
        event_data = {
            'title': 'New Event',
            'event_date': '2023-06-01',
            'category': 'memory'
        }
        response = self.client.post(url, event_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user'], self.user1.pk)

    def test_users_can_only_modify_own_events(self):
        """Users can only update/delete their own events"""
        self.client.force_authenticate(user=self.user2)
        url = reverse('event-detail', kwargs={'pk': self.private_event.pk})

        # Try to update another user's event
        response = self.client.put(url, {
            'title': 'Hacked Event',
            'event_date': '2023-01-01',
            'category': 'memory'
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Try to delete another user's event
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_users_can_modify_own_events(self):
        """Users can update their own events"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('event-detail', kwargs={'pk': self.private_event.pk})

        response = self.client.put(url, {
            'title': 'Updated Event',
            'event_date': '2023-01-02',
            'category': 'major',
            'privacy_level': 'private'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Event')
