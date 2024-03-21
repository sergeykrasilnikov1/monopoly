import json
import asyncio
import random

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from .models import Room, User, Cell
from channels.db import database_sync_to_async
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore

class PresenceConsumer(WebsocketConsumer):
    connections = []

    def connect(self):
        self.accept()
        self.user = self.scope["user"]
        self.connections.append(self)
        self.update_indicator(msg="Connected")

    def disconnect(self, code):
        self.update_indicator(msg="Disconnected")
        self.connections.remove(self)
        return super().disconnect(code)

    def update_indicator(self, msg):
        for connection in self.connections:
            connection.send(
                text_data=json.dumps(
                    {
                        "msg": f"{self.user} {msg}",
                        "online": f"{len(self.connections)}",
                        "users": [f"{user.scope['user']}" for user in self.connections],
                    }
                )
            )




@database_sync_to_async
def room_get(name):
    try:
        room = Room.objects.get(name=name)
        return room
    except Room.DoesNotExist:
        return None

class ChatConsumer(AsyncWebsocketConsumer):
    connected_clients = dict()
    session_keys = []

    @database_sync_to_async
    def room_create(self, color):
        room = Room.objects.get(name=self.room_name)
        if not (room.start_game):
            self.user.room = room
            self.user.color = 0
            self.user.pos = 1
            self.user.active = 10000
            self.user.passive = 20000
            self.user.save()
        self.connected_clients.setdefault(self.room_name, []).append(self)

    @database_sync_to_async
    def room_update(self, players_count):
        if players_count != 0:
            room = Room.objects.get(name=self.room_name)
            if self.user.room != room:
                self.user.color = players_count
                self.user.pos = 1
                self.user.room = room
                self.user.active = 10000
                self.user.passive = 20000
                self.user.save()
        self.connected_clients.setdefault(self.room_name, []).append(self)

    def user_count(self):
        if self.connected_clients.get(self.room_name):
            return len(self.connected_clients[self.room_name])
        else:
            return 0

    # @database_sync_to_async
    async def connect(self):
        # self.session_key = self.scope["session"].session_key

        self.user = self.scope["user"]
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'room_{self.room_name}'
        # await self.save_connection()
        room = await room_get(self.room_name)




        # Prisоedinяemся k gruppe комnatы
        if self.user_count() < 4:
            if self.user_count() == 0:
                await self.room_create(self.user_count())
            else:
                await self.room_update(self.user_count())
            await self.accept()
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.channel_layer.group_send(self.room_group_name,
                                                {
                                                    'type': 'chat_message',
                                                    'message': f"{self.user.username} Connected."
                                                }
                                                )
            await self.channel_layer.send(
                self.channel_name,
                {
                    'type': 'init_data',

                })
            if self.user_count() == room.players_count:
                room.start_game = True
                await database_sync_to_async(room.save)()
                # sync_to_async(room.save())
                await self.channel_layer.group_send(self.room_group_name,
                                                    {
                                                        'type': 'start',
                                                    }
                                                    )

    async def disconnect(self, close_code):
        print(self.user.pos)
        # await self.remove_connection()
        # self.user.room = None
        # self.user.color = 0
        # await database_sync_to_async(self.user.save)()
        self.connected_clients[self.room_name].remove(self)
        # await self.room_update(self.user_count())

        # Oтsoedinяemся oт gruppy комnatы
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # def get_active_connections(cls, room_group_name):
    #     return cls.channel_layer.group_channels(room_group_name)
    #
    # async def save_connection(self):
    #     # Save the connection information (e.g., session_key or user_id)
    #     session_key = self.scope["session"].session_key
    #     self.session_keys.append(session_key)
    #
    # async def remove_connection(self):
    #     # Remove the connection information when disconnecting
    #     session_key = self.scope["session"].session_key
    #     self.session_keys.remove(session_key)
    async def receive(self, text_data=None, bytes_data=None):
        # Обрабатываем полученные сообщения
        text_data_json = json.loads(text_data)

        # Определение типа сообщения
        message_type = text_data_json.get('type')

        if (message_type == 'chat_message'):
            user = self.scope['user']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'user': user.username,
                    'user_color': user.color+1,
                    'message': text_data_json.get('message'),
                    'next_player': text_data_json.get('next_player', 0),
                }
            )

        elif (message_type == 'move_player'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'move_player',
                    'message': text_data_json.get('message'),
                    'dices': text_data_json.get('dices'),
                }
            )

        elif (message_type == 'buy_company'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'buy_company',
                    'cell_pos': text_data_json.get('cell_pos'),
                    'target': text_data_json.get('target')
                }
            )
        elif (message_type == 'prison'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'prison',
                }
            )
        elif (message_type == 'display_window'):
            target = \
            [i for i in self.connected_clients[self.room_name] if i.user.color == text_data_json.get('player')][0]
            await self.channel_layer.send(
                target.channel_name,
                {
                    'type': 'display_window',
                })
        elif (message_type == 'deal_suggest'):
            print(self.connected_clients[self.room_name])
            target = \
            [i for i in self.connected_clients[self.room_name] if i.user.color == int(text_data_json.get('enemy'))][0]
            await self.channel_layer.send(
                target.channel_name,
                {
                    'type': 'deal_suggest',
                    'enemy': text_data_json.get('enemy'),
                    'player': text_data_json.get('player'),
                    'my_money': text_data_json.get('my_money'),
                    'enemy_money': text_data_json.get('enemy_money'),
                    'all_my_money': text_data_json.get('all_my_money'),
                    'all_enemy_money': text_data_json.get('all_enemy_money'),
                    'my_companies': text_data_json.get('my_companies'),
                    'enemy_companies': text_data_json.get('enemy_companies'),
                })
        elif (message_type == 'deal_accept'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'deal_accept',
                    'player': text_data_json.get('player'),
                    'my_companies': text_data_json.get('my_companies'),
                    'enemy_companies': text_data_json.get('enemy_companies'),
                    'enemy': text_data_json.get('enemy'),
                }
            )


        elif (message_type == 'auction'):
            target = \
            [i for i in self.connected_clients[self.room_name] if i.user.color == int(text_data_json.get('target'))][0]
            await self.channel_layer.send(
                target.channel_name,
                {
                    'target': text_data_json.get('target'),
                    'type': 'auction',
                    'price': text_data_json.get('price'),
                    'cell': text_data_json.get('cell'),
                    'auction_players': text_data_json.get('auction_players'),
                    'auction_players_count': text_data_json.get('auction_players_count')
                })

        elif (message_type == 'pawn'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'pawn',
                    'company': text_data_json.get('company'),
                }
            )

        elif (message_type == 'monopoly_view'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'monopoly_view',
                    'cells': text_data_json.get('cells'),
                }
            )

        elif (message_type == 'bankrupt'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'bankrupt',
                    'player': text_data_json.get('player'),
                }
            )


    async def start(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'start',
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def chat_message(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'chat_message',
                'user': event.get('user', ''),
                'user_color': event.get('user_color', 0),
                'next_player': event.get('next_player', 0),
                "message": event['message'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def move_player(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'move_player',
                "message": event['message'],
                'dices': event['dices'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def buy_company(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'buy_company',
                "cell_pos": event['cell_pos'],
                'target': event.get('target', 0),
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def prison(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'prison',
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def display_window(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'display_window',
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def deal_suggest(self, event):
        # Отправляем сообщение обратно через WebSocket
        print(self.connected_clients)
        await self.send(text_data=json.dumps(
            {
                'type': 'deal_suggest',
                'enemy': event['enemy'],
                'player': event['player'],
                'my_money': event['my_money'],
                'enemy_money': event['enemy_money'],
                'all_my_money': event['all_my_money'],
                'all_enemy_money': event['all_enemy_money'],
                'my_companies': event['my_companies'],
                'enemy_companies': event['enemy_companies'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def deal_accept(self, event):
        print(event['enemy'], event['player'])
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'deal_accept',
                'enemy': event['enemy'],
                'player': event['player'],
                'my_companies': event['my_companies'],
                'enemy_companies': event['enemy_companies'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def auction(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'auction',
                'target': event['target'],
                'cell': event['cell'],
                'price': event['price'],
                'auction_players': event['auction_players'],
                'auction_players_count': event['auction_players_count'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def pawn(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'pawn',
                'company': event['company'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def monopoly_view(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'monopoly_view',
                'cells': event['cells'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))

    async def bankrupt(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'bankrupt',
                'player': event['player'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))
    async def init_data(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                'type': 'init_data',
                'username': self.user.username,
                'color': self.user.color,
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_name]],
            }
        ))