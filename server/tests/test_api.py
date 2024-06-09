from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from server.models import Room, Cell
from rest_framework import status

User = get_user_model()


class PlayerViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client.login(username='testuser', password='12345')

    def test_update_player(self):
        url = reverse('player-detail', kwargs={'username': self.user.username})
        data = {'first_name': 'UpdatedName'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'UpdatedName')


class RoomViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.room = Room.objects.create(name="test_room")
        self.client.login(username='testuser', password='12345')

    def test_update_room(self):
        url = reverse('room-detail', kwargs={'name': self.room.name})
        data = {'players_count': 3}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.room.refresh_from_db()
        self.assertEqual(self.room.players_count, 3)


class CellViewSetTest(APITestCase):
    def setUp(self):
        self.room = Room.objects.create(name="test_room")
        self.cell = Cell.objects.create(name='cell1', room=self.room, buy_cost=100, pos=1)

    def test_get_cell(self):
        url = reverse('cell-detail', kwargs={'pk': self.cell.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'cell1')


class BuyCompanyTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.room = Room.objects.create(name="test_room")
        self.cell = Cell.objects.create(name='cell1', room=self.room, buy_cost=100, pos=1)
        self.client.login(username='testuser', password='12345')

    def test_buy_company(self):
        url = reverse('buy_company')
        data = {
            'room_name': self.room.name,
            'cell': self.cell.pos,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cell.refresh_from_db()
        self.assertEqual(self.cell.owner, self.user)
