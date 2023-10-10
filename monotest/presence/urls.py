from django.urls import path

from . import consumers
from . import views
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, RoomViewSet, CellViewSet

router = DefaultRouter()
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'cells', CellViewSet, basename='cell')



urlpatterns = [
    path('api/players/custom_action/<str:custom_arg>/', views.PlayerViewSet.as_view({'get': 'custom_action'}), name='custom-action'),
    path('game/round/', views.round, name='round'),
    path('game/build/', views.build, name='build'),
    path('game/buy/', views.buy, name='buy'),
    path('game/roll/', views.roll, name='roll'),
    path('api/', include(router.urls)),
    path('', views.index, name="index"),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("ws/presence", consumers.PresenceConsumer.as_asgi()),
    path('presence/<str:room_name>/', views.room, name='room'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
]