from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from .models import Event, Friendship, EventPrivacyLevel, FriendshipStatus

User = get_user_model()


class UserViewSetTestCase(APITestCase):
    """Test cases for UserViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.inactive_user = User.objects.create_user(
            username='inactive',
            email='inactive@example.com',
            password='testpass123',
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
            public_fields = {'id', 'username', 'first_name', 'last_name', 'profile_picture', 'location'}
            self.assertEqual(set(user_data.keys()), public_fields)

            # Ensure private fields are not exposed
            self.assertNotIn('email', user_data)
            self.assertNotIn('birth_date', user_data)

    def test_retrieve_user_public_fields(self):
        """Retrieving specific user returns only public fields"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('user-detail', kwargs={'pk': self.user2.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('email', response.data)
        self.assertNotIn('birth_date', response.data)

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
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
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
        self.friends_event = Event.objects.create(
            user=self.user1,
            title='Friends Event',
            event_date='2023-01-03',
            privacy_level=EventPrivacyLevel.FRIENDS
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

    def test_authenticated_users_see_friends_events_when_friends(self):
        """Authenticated users see friends' events when they are friends"""
        # Create friendship
        Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.ACCEPTED
        )

        self.client.force_authenticate(user=self.user2)
        url = reverse('event-list')
        response = self.client.get(url)

        # Should see public event and friends event from user1
        titles = [event['title'] for event in response.data["results"]]
        self.assertIn('Public Event', titles)
        self.assertIn('Friends Event', titles)
        self.assertNotIn('Private Event', titles)

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


class FriendshipViewSetTestCase(APITestCase):
    """Test cases for FriendshipViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        self.user3 = User.objects.create_user(
            username='user3',
            email='user3@example.com',
            password='testpass123'
        )

    def test_list_friendships_requires_authentication(self):
        """Listing friendships requires authentication"""
        url = reverse('friendship-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_users_only_see_own_friendships(self):
        """Users only see friendships they're involved in"""
        # Create friendships
        friendship1 = Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.PENDING
        )
        friendship2 = Friendship.objects.create(
            requester=self.user2,
            addressee=self.user3,
            status=FriendshipStatus.ACCEPTED
        )

        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)  # Only friendship1
        self.assertEqual(response.data["results"][0]['id'], str(friendship1.pk))

    def test_create_friendship_sets_requester_automatically(self):
        """Creating a friendship automatically sets requester to authenticated user"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-list')
        response = self.client.post(url, {
            'addressee': self.user2.pk
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['requester'], self.user1.pk)
        self.assertEqual(response.data['addressee'], self.user2.pk)
        self.assertEqual(response.data['status'], FriendshipStatus.PENDING)

    def test_create_friendship_requires_authentication(self):
        """Creating friendships requires authentication"""
        url = reverse('friendship-list')
        response = self.client.post(url, {
            'addressee': self.user2.pk
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_accept_friendship_only_by_addressee(self):
        """Only the addressee can accept a friendship"""
        friendship = Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.PENDING
        )

        # Try to accept as requester (should fail)
        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-accept', kwargs={'pk': friendship.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Accept as addressee (should succeed)
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], FriendshipStatus.ACCEPTED)

    def test_decline_friendship_only_by_addressee(self):
        """Only the addressee can decline a friendship"""
        friendship = Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.PENDING
        )

        # Try to decline as requester (should fail)
        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-decline', kwargs={'pk': friendship.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Decline as addressee (should succeed)
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], FriendshipStatus.DECLINED)

    def test_block_friendship_by_either_party(self):
        """Either party can block a friendship"""
        friendship = Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.ACCEPTED
        )

        # Block as requester
        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-block', kwargs={'pk': friendship.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], FriendshipStatus.BLOCKED)

    def test_block_friendship_requires_involvement(self):
        """Only parties involved in friendship can block it"""
        friendship = Friendship.objects.create(
            requester=self.user1,
            addressee=self.user2,
            status=FriendshipStatus.ACCEPTED
        )

        # Try to block as uninvolved user
        self.client.force_authenticate(user=self.user3)
        url = reverse('friendship-block', kwargs={'pk': friendship.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_friendship_queryset_filters_by_active_users(self):
        """Friendship creation only allows active users"""
        inactive_user = User.objects.create_user(
            username='inactive',
            email='inactive@example.com',
            password='testpass123',
            is_active=False
        )

        self.client.force_authenticate(user=self.user1)
        url = reverse('friendship-list')
        response = self.client.post(url, {
            'addressee': inactive_user.pk
        })

        # Should fail because inactive user is not in queryset
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
