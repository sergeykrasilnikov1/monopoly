import json
import asyncio

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from .models import Room, User, Cell


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



@sync_to_async
def room_get(name):
    try:
        room = Room.objects.get(name=name)
        return room
    except Exception:
        return None



class GameConsumer(AsyncWebsocketConsumer):
    async def receive(self, text_data=None, bytes_data=None):
        pass

    async def roll(self, event):
        pass
class ChatConsumer(AsyncWebsocketConsumer):
    connected_clients = dict()

    @sync_to_async
    def room_create(self, color):
        room = Room.objects.create(name=self.room_group_name, players_count=1)
        Cell.objects.all().delete()
        for i in range(40):
            Cell.objects.create(name=f'cell{i}', color=i//3, buy_cost=i*50, pos=i)
        self.user.pos = 0
        self.user.room = room
        self.user.color = 0
        self.user.active = 20000
        self.user.passive = 20000
        self.user.save()
        self.connected_clients.setdefault(self.room_group_name, []).append(self)

    @sync_to_async
    def room_update(self, players_count):
        if players_count != 0:
            room = (Room.objects.get(name=self.room_group_name))
            Room.objects.filter(name=self.room_group_name).update(players_count=players_count+1)
            if self.user.room != room:
                self.user.color = players_count
                self.user.pos = 0
                self.user.room = room
                self.user.active = 20000
                self.user.passive = 20000
                self.user.save()
                self.connected_clients.setdefault(self.room_group_name, []).append(self)
        else:
            Room.objects.filter(name=self.room_group_name).delete()
            self.user.room = None

    def user_count(self):
        if self.connected_clients.get(self.room_group_name):
            return len(self.connected_clients[self.room_group_name])
        else:
            return 0

    async def connect(self):
        self.user = self.scope["user"]
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'room_{self.room_name}'

            # Присоединяемся к группе комнаты
        if self.user_count() < 4:
            if not await room_get(self.room_group_name):
                if self.user_count()==0:
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
            if self.user_count() == 4:
                await self.channel_layer.group_send(self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': f"Game start"
                    }
                    )
    async def disconnect(self, close_code):
        self.connected_clients[self.room_group_name].remove(self)
        await self.room_update(self.user_count())

        # Отсоединяемся от группы комнаты
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data=None, bytes_data=None):
        # Обрабатываем полученные сообщения
        # await asyncio.sleep(1)  # Задержка для имитации обработки сообщения
        # action = {'display': 'display',


        # }
        text_data = text_data.split()
        if (text_data[0] == '1'):
            await self.channel_layer.send(
                self.channel_name,
                {
                    'type': 'chat_message',
                    'message': text_data[1]
                }
        )

        if (text_data[0] == '2'):
            await self.channel_layer.send(
                self.channel_name,
                {
                    'type': 'display',
                    'roll_display': 'display'
                })

        if (text_data[0] == '3'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'roll_message',
                    'roll': text_data[1]
                })
        if (text_data[0] == '4'):
            target = [i for i in self.connected_clients[self.room_group_name] if i.user.color==int(text_data[1])][0]
            await self.channel_layer.send(
                target.channel_name,
                {
                    'type': 'display',
                    'roll_display':'display',
                })
        if (text_data[0] == '5'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'buy',
                    'cell': text_data[1]
                })

        if (text_data[0] == '6'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'build',
                    'cell_star': text_data[1],
                    'cell_name': text_data[2]
                })


    async def chat_message(self, event):
        # Отправляем сообщение обратно через WebSocket

        await self.send(text_data=json.dumps(
            {
                "message": event['message'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user'] } {user.user.passive} {user.user.active}" for user in self.connected_clients[self.room_group_name]],
            }
        ))

    async def roll_message(self, event):
        # Отправляем сообщение обратно через WebSocket

        await self.send(text_data=json.dumps(
            {
                "roll": event['roll'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user'] } {user.user.passive} {user.user.active}" for user in self.connected_clients[self.room_group_name]],
            }
        ))

    async def display(self, event):
        # Отправляем сообщение обратно через WebSocket

        await self.send(text_data=json.dumps(
            {
                "roll_display": event['roll_display'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_group_name]],
            }
        ))

    async def buy(self, event):
        # Отправляем сообщение обратно через WebSocket

        await self.send(text_data=json.dumps(
            {
                "cell": event['cell'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_group_name]],
            }
        ))

    async def build(self, event):
        # Отправляем сообщение обратно через WebSocket
        await self.send(text_data=json.dumps(
            {
                "cell_star": event['cell_star'],
                "cell_name": event['cell_name'],
                "online": f"{self.user_count()}",
                "users": [f"{user.scope['user']} {user.user.passive} {user.user.active}" for user in
                          self.connected_clients[self.room_group_name]],
            }
        ))




