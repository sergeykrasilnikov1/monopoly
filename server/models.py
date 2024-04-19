
from django.contrib.auth.models import AbstractUser
from django.db import models






class Room(models.Model):
    name = models.CharField(max_length=100)
    players_count = models.PositiveSmallIntegerField(default=0)
    creation_datetime = models.DateTimeField(auto_now_add=True, null=True)
    round = models.PositiveIntegerField(default=0)
    current_player = models.SmallIntegerField(default=0)
    start_game = models.BooleanField(default=False)
    count_doubles = models.PositiveSmallIntegerField(default=0)
    count_deals = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return self.name


class User(AbstractUser):
    active = models.IntegerField(default=20000)
    passive = models.IntegerField(default=20000)
    color = models.PositiveIntegerField(default=0)
    pos = models.PositiveIntegerField(default=0)
    in_prison = models.BooleanField(default=False)
    count_roll_in_prison = models.PositiveSmallIntegerField(default=0)
    monopoly = models.CharField(max_length=20, default='', blank=True)
    creation_datetime = models.DateTimeField(auto_now_add=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.SET(None), null=True, blank=True)
    image = models.ImageField(upload_to='users_images', null=True, blank=True)
    lose = models.BooleanField(default=False)
    build_allowed = models.BooleanField(default=False)
    # self.cells = []

    # def __str__(self):
    #     return self.color


class Cell(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    # group_colors = models.PositiveIntegerField(default=0)
    # build_cost = models.JSONField()
    current_cost = models.PositiveIntegerField(default=0)
    monopoly = models.BooleanField(default=False)
    stars = models.PositiveIntegerField(default=0)
    buy_cost = models.PositiveIntegerField()
    pos = models.PositiveIntegerField(default=0)
    color = models.PositiveIntegerField(default=0, null=True)
    pawn_rounds_remaining = models.PositiveIntegerField(default=0)



