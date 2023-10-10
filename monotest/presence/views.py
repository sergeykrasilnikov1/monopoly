from django.contrib.auth.views import LoginView
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.urls import reverse_lazy
from django.views.generic import CreateView
from rest_framework.response import Response

from .forms import LoginForm, UserRegistrationForm
from django.http import HttpResponse
from django.contrib.auth import get_user_model
User = get_user_model()


from rest_framework import viewsets
from .models import Room, Cell
from .serializers import PlayerSerializer, RoomSerializer, CellSerializer

from django.http import JsonResponse
import json

def roll(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            dice1 = data.get('dice1')
            dice2 = data.get('dice2')
            room_name = 'room_' + data.get('room_name')
            player = request.user
            player.dice1=dice1
            player.dice2=dice2
            player.pos += dice2+dice1
            player.pos %= 40
            player.save()
            room = Room.objects.filter(name=room_name)[0]
            room.player_turn = (room.player_turn + 1) % room.players_count
            room.save()
            response_data = {'message': f'{User.objects.filter(room=room, color=room.player_turn)[0].id}'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

def buy(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            a = data.get('cell')
            room_name = 'room_' + data.get('room_name')
            cell = Cell.objects.get(name=f"cell{data.get('cell')}")
            player = request.user
            player.active -= cell.buy_cost
            player.save()
            cell.owner = player
            cell.buy_cost = cell.buy_cost//10
            cell.save()
            monopoly = [i.color for i in Cell.objects.all() if i.owner == player]
            monopoly_count = [str(i[0]) for i in set(map(lambda x: (x, monopoly.count(x)), monopoly)) if i[1] == 1]
            response_data = {'message': ' '.join(monopoly_count)}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)


def build(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # a = data.get('cell')
            # room_name = 'room_' + data.get('room_name')
            print(data.get('cell'))
            cell = Cell.objects.get(name=f"{data.get('cell')}")
            player = request.user
            player.active -= cell.buy_cost*5
            player.save()
            cell.buy_cost = cell.buy_cost*2
            cell.stars += 1
            cell.save()
            response_data = {'message': f'{cell.stars}',
                             'cell': f'{cell.name}'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

def round(request):
    if request.method == 'POST':
        try:
            player = request.user
            player.active+=1000
            player.passive += 1000
            player.save()
            response_data = {'message': f'ok'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = PlayerSerializer


    def custom_action(self, request, custom_arg):

        room = Room.objects.get(name=f'room_{custom_arg}')
        players = User.objects.filter(room=room)
        # Custom logic using pk and custom_arg
        # ...
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer



class CellViewSet(viewsets.ModelViewSet):
    queryset = Cell.objects.all()
    serializer_class = CellSerializer


class UserLoginView(LoginView):
    template_name = 'login.html'
    form_class = LoginForm


class UserRegistrationView(CreateView):
    model = User
    form_class = UserRegistrationForm
    template_name = 'register.html'
    success_url = reverse_lazy('login')


def move(request):
    print(request)
    return HttpResponse()
    # return render(request, 'room.html', {
    #     'room_name': room_name})


def index(request):
    return render(request, "index.html")


def room(request, room_name):
    return render(request, 'room.html', {
        'room_name': room_name})


# for i in range(40):
#     Cell.objects.create(name=f'cell{i}', color=i//3, buy_cost=i*50, pos=i)
