
from django.contrib.auth.models import AbstractUser
from django.db import models






class Room(models.Model):
    name = models.CharField(max_length=100)
    players_count = models.PositiveSmallIntegerField(default=0)
    creation_datetime = models.DateTimeField(auto_now_add=True, null=True)
    round = models.PositiveIntegerField(default=0)
    player_turn = models.PositiveSmallIntegerField(default=0)


class User(AbstractUser):
    active = models.IntegerField(default=20000)
    passive = models.IntegerField(default=20000)
    color = models.PositiveIntegerField(default=0)
    pos = models.PositiveIntegerField(default=0)
    creation_datetime = models.DateTimeField(auto_now_add=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.SET(None), null=True)
    dice1 = models.PositiveIntegerField(default=0)
    dice2 = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='users_images', null=True, blank=True)
    # self.cells = []


class Cell(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    # group_colors = models.PositiveIntegerField(default=0)
    # build_cost = models.JSONField()
    stars = models.PositiveIntegerField(default=0)
    buy_cost = models.PositiveIntegerField()
    pos = models.PositiveIntegerField(default=0)
    color = models.PositiveIntegerField(default=0)



