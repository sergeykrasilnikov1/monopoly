# Generated by Django 4.2 on 2024-03-02 05:02

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0004_remove_cell_pawn"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="room",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=models.SET(None), to="server.room"
            ),
        ),
    ]
