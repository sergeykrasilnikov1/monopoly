# Generated by Django 4.2.5 on 2023-10-05 07:14

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("presence", "0005_room_player_turn_room_round"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="dice1",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="player",
            name="dice2",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
