from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from server.models import Room, Cell
from rest_framework import status

User = get_user_model()


class FunctionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.room = Room.objects.create(name="test_room")
        self.cell = Cell.objects.create(name='cell1', room=self.room, buy_cost=100, pos=1)
        self.client.login(username='testuser', password='12345')

    def test_bankrupt(self):
        url = reverse('bankrupt')
        data = {'room_name': self.room.name}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cell.refresh_from_db()
        self.assertIsNone(self.cell.owner)

    def test_build(self):
        url = reverse('build')
        data = {'room_name': self.room.name, 'cell': self.cell.pos}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cell.refresh_from_db()
        self.assertEqual(self.cell.stars, 1)
