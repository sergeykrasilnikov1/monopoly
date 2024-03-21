
import json

from django.contrib.auth import get_user_model
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.views.generic import ListView, DetailView
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.mixins import UpdateModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from server.models import Room, Cell
from server.serializers import PlayerSerializer, RoomSerializer, CellSerializer
from .filter import PlayerFilter, CellFilter
from .forms import LoginForm, UserRegistrationForm
from django.shortcuts import render, redirect
from .forms import RoomCreateForm

User = get_user_model()

monopoly = {
    0: [1, 3],
    1: [4, 12, 28],
    2: [5, 15, 25, 35],
    3: [6, 8, 9],
    4: [11, 13, 14],
    5: [16, 18, 19],
    6: [21, 23, 24],
    7: [26, 27, 29],
    8: [31, 32, 34],
    9: [37, 39],
}
# Create your views here.

class RoomlListView(ListView):
    model = Room
    template_name = 'index.html'  # Specify the path to your template
    context_object_name = 'rooms'  # The variable name used in the template to represent the list of objects


class RoomDetailView(DetailView):
    model = Room
    template_name = 'room.html'
    context_object_name = 'room'
    slug_field = 'name'  # Указываем поле, которое будет использоваться для идентификации объекта
    slug_url_kwarg = 'name'  # Указываем название аргумента в URL


def room(request, room_name):
    return render(request, 'room.html', {
        'room_name': room_name})

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = '__all__'
    filterset_fields = ['room', 'color']
    filterset_class = PlayerFilter
    lookup_field = 'username'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



class RoomViewSet(viewsets.ModelViewSet, RetrieveModelMixin,UpdateModelMixin):
    permission_classes = [IsAuthenticated]
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'name'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CellViewSet(viewsets.ModelViewSet):
    queryset = Cell.objects.all()
    serializer_class = CellSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name', 'pawn']
    filterset_class = CellFilter

    # def get_cell(self, request, room_name, pos):
    #
    #     room1 = Room.objects.get(name=room_name)
    #     cell = Cell.objects.filter(room=room1, pos=pos)[0]
    #     serializer = CellSerializer(cell)
    #     return Response(serializer.data)


class UserLoginView(LoginView):
    template_name = 'login.html'
    form_class = LoginForm


class UserRegistrationView(CreateView):
    model = User
    form_class = UserRegistrationForm
    template_name = 'register.html'
    success_url = reverse_lazy('login')


def buy_company(request):

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            room = Room.objects.filter(name=data.get('room_name'))[0]
            cell = Cell.objects.get(name=f"cell{data.get('cell')}", room=room)

            if data.get('price'):

                player = User.objects.get(room=room, color=data.get('player'))
                player.active -= int(data.get('price'))
            else:
                player = request.user
                player.active -= cell.buy_cost
            player.save()
            cell.owner = player
            cell.color = player.color
            cell.current_cost = cell.buy_cost//10
            cell.save()
            player_cells = [cell.pos for cell in Cell.objects.filter(owner=player) if cell.owner == player]
            monopoly_count = [str(i) for i, j in monopoly.items() if all(item in player_cells for item in j)]
            cells = []
            for i in monopoly_count:
                for j in monopoly[int(i)]:
                    cell = Cell.objects.get(name=f"cell{j}", room=room)
                    if not cell.monopoly:
                        cell.monopoly = True
                        cell.current_cost = cell.buy_cost
                        cell.save()
                        cells.append(str(cell.pos))
            response_data = {'message': ' '.join(monopoly_count),
                             'cells': " ".join(cells)}
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
            cell = Cell.objects.get(name=f"cell{data.get('cell')}")
            player = request.user
            cell.current_cost = cell.current_cost * 2
            player.active -= cell.current_cost
            player.save()
            cell.stars += 1
            cell.save()
            response_data = {'message': f'{cell.id}',
                             'stars': f'{cell.stars}'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

def sell(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # a = data.get('cell')
            # room_name = 'room_' + data.get('room_name')
            cell = Cell.objects.get(name=f"cell{data.get('cell')}")
            player = request.user
            cell.current_cost = cell.current_cost // 2
            player.active += cell.current_cost
            player.save()
            cell.stars -= 1
            cell.save()
            response_data = {'message': f'{cell.id}',
                             'stars': f'{cell.stars}'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)


def pay_rent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            room = Room.objects.filter(name=data.get('room_name'))[0]
            cell = Cell.objects.get(name=f"cell{data.get('cell')}", room=room)
            player = request.user
            player.active -= cell.current_cost
            player.save()
            enemy = User.objects.get(room=player.room, color=data.get('enemy'))
            enemy.active += cell.current_cost
            enemy.save()
            response_data = {'message': 'Ok'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)
def pawn(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # room_name = 'room_' + data.get('room_name')
            cell = Cell.objects.get(name=f"cell{data.get('cell')}", room__name=data.get('room_name'))
            player = request.user
            player.active += int(cell.buy_cost * 0.75)
            player.save()
            cell.current_cost = 0
            response_data = {'message': f'{cell.id}'}
            cell.pawn_rounds_remaining = 15
            cell.save()
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

def unpawn(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # room_name = 'room_' + data.get('room_name')
            cell = Cell.objects.get(name=f"cell{data.get('cell')}", room__name=data.get('room_name'))
            player = request.user
            player.active -= cell.buy_cost
            player.save()
            cell.current_cost = cell.buy_cost//10
            cell.save()
            response_data = {'message': f'{cell.id}'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)

def end_round(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            room = Room.objects.filter(name=data.get('room_name'))[0]
            cells = Cell.objects.filter(room=room)
            for cell in cells:
                if cell.pawn_rounds_remaining:
                    cell.pawn_rounds_remaining -= 1
                    if cell.pawn_rounds_remaining == 0:
                        cell.color = None
                        cell.current_cost = cell.buy_cost
                        cell.owner = None
                    cell.save()
            response_data = {'message': 'Ok'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)


def deal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            room_name =  data.get('room_name')
            room = Room.objects.filter(name=room_name)[0]
            player = User.objects.get(room=room, color=data.get('player'))
            enemy = User.objects.get(room=room, color=data.get('enemy'))
            player_cells = data.get('player_cells')
            enemy_cells = data.get('enemy_cells')
            for id in player_cells:
                cell = Cell.objects.get(name='cell' + str(id))
                cell.owner = enemy
                cell.color = enemy.color
                cell.save()
            for id in enemy_cells:
                cell = Cell.objects.get(name=id)
                cell.owner = player
                cell.color = player.color
                cell.save()
            player.active = player.active - int(data.get('player_money') or 0) + int(data.get('enemy_money') or 0)
            enemy.active = enemy.active - int(data.get('enemy_money') or 0) + int(data.get('player_money') or 0)
            player.save()
            enemy.save()
            player_cells = [cell.pos for cell in Cell.objects.filter(owner=player) if cell.owner == player]
            monopoly_count = [str(i) for i, j in monopoly.items() if all(item in player_cells for item in j)]
            for i in monopoly_count:
                for j in monopoly[int(i)]:
                    cell = Cell.objects.get(name=f"cell{j}")
                    if not cell.monopoly:
                        cell.monopoly = True
                        cell.current_cost = cell.buy_cost
                        cell.save()
            player_cells = [cell.pos for cell in Cell.objects.filter(owner=enemy) if cell.owner == enemy]
            monopoly_count = [str(i) for i, j in monopoly.items() if all(item in player_cells for item in j)]
            for i in monopoly_count:
                for j in monopoly[int(i)]:
                    cell = Cell.objects.get(name=f"cell{j}")
                    if not cell.monopoly:
                        cell.monopoly = True
                        cell.current_cost = cell.buy_cost
                        cell.save()
            response_data = {'message': 'Ok'}
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {'message': 'Неверный формат JSON.', 'error': str(e)}
            return JsonResponse(response_data, status=400)
    else:
        response_data = {'message': 'Метод не разрешен.'}
        return JsonResponse(response_data, status=405)






def create_room(request):
    if request.method == 'POST':
        form = RoomCreateForm(request.POST)
        if form.is_valid():
            form.save()
            room_name = form.cleaned_data['name']
            room = Room.objects.get(name=room_name)
            for i in range(40):
                Cell.objects.create(name=f'cell{i}', color=10, buy_cost=i * 50 + 50, current_cost=i * 50 + 50,
                                    pos=i, room=room)
            return redirect('../')
    else:
        form = RoomCreateForm()

    return render(request, 'room_create.html', {'form': form})

