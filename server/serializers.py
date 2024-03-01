from rest_framework import serializers
from .models import User, Room, Cell


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'



class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = '__all__'
