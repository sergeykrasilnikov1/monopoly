# Generated by Django 4.2 on 2024-03-12 05:29

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0007_room_start_game"),
    ]

    operations = [
        migrations.RenameField(
            model_name="room",
            old_name="player_turn",
            new_name="current_player",
        ),
    ]