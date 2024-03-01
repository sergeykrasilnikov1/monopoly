import django_filters
from django.contrib.auth import get_user_model
from .models import Cell
User = get_user_model()

class PlayerFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {'room__name': ['exact', 'icontains']}


class CellFilter(django_filters.FilterSet):
    class Meta:
        model = Cell
        fields = {'room__name': ['exact', 'icontains'], 'current_cost': ['exact'], 'name': ['exact'], 'pos': ['exact']}