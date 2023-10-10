# Generated by Django 4.2.5 on 2023-10-05 08:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("presence", "0006_player_dice1_player_dice2"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="active",
            field=models.IntegerField(default=20000),
        ),
        migrations.AddField(
            model_name="user",
            name="color",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="user",
            name="creation_datetime",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="dice1",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="user",
            name="dice2",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="user",
            name="passive",
            field=models.IntegerField(default=20000),
        ),
        migrations.AddField(
            model_name="user",
            name="pos",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="user",
            name="room",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="presence.room",
            ),
        ),
        migrations.AlterField(
            model_name="cell",
            name="owner",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.DeleteModel(
            name="Player",
        ),
    ]