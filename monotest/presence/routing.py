from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/presence/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    path(r'ws/presence/', consumers.PresenceConsumer.as_asgi()),
    re_path(r'ws/game/presence/(?P<room_name>\w+)/$', consumers.GameConsumer.as_asgi()),
]