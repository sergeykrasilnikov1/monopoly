from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from server.models import Room, Cell

User = get_user_model()

class RoomListViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        Room.objects.create(name="test_room")

    def test_room_list_view(self):
        response = self.client.get("")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')

# class RoomDetailViewTest(TestCase):
#     def setUp(self):
#         self.client = Client()
#         self.room = Room.objects.create(name="test_room")
#
#     def test_room_detail_view(self):
#         response = self.client.get(reverse('room_detail', args=[self.room.name]))
#         self.assertEqual(response.status_code, 200)
#         self.assertTemplateUsed(response, 'room.html')
#         self.assertContains(response, 'test_room')
#
class UserLoginViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='12345')

    def test_login_view(self):
        response = self.client.post(reverse('login'), {'username': 'testuser', 'password': '12345'})
        self.assertEqual(response.status_code, 302)  # Redirects after successful login

class UserRegistrationViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_registration_view(self):
        response = self.client.post(reverse('register'), {
            'username': 'newuser',
            'email': "test@bk.ru",
            'password1': 'testpassword',
            'password2': 'testpassword',
        })
        self.assertEqual(response.status_code, 302)  # Redirects after successful registration
        self.assertTrue(User.objects.filter(username='newuser').exists())
