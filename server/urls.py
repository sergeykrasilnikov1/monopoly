from django.urls import path

from . import views
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet, RoomViewSet, CellViewSet, RoomlListView, RoomDetailView
from . import consumers

router = DefaultRouter()
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'cells', CellViewSet, basename='cell')
urlpatterns = [
    path('parse/', views.api, name='api'),
    path('game/pay_rent/', views.pay_rent, name='pay_rent'),
    path('game/deal/', views.deal, name='deal'),
    path('game/unpawn/', views.unpawn, name='unpawn'),
    path('game/pawn/', views.pawn, name='pawn'),
    path('game/sell/', views.sell, name='sell'),
    path('game/build/', views.build, name='build'),
    path('game/buy_company/', views.buy_company, name='buy_company'),
    path('api/', include(router.urls)),
    path('', RoomlListView.as_view(), name="index"),
    path('game/<str:name>/', views.RoomDetailView.as_view(), name='room'),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path("ws/game/", consumers.PresenceConsumer.as_asgi()),
    path('api/cells/get_cell/<str:room_name>/<int:pos>/', views.CellViewSet.as_view({'get': 'get_cell'}), name='get_cell'),
    path('api/players/players_on_room/<str:room>/', views.PlayerViewSet.as_view({'get': 'players_on_room'}), name='players_on_room'),

]