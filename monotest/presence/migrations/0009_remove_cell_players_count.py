# Generated by Django 4.2.5 on 2023-10-07 06:51

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("presence", "0008_alter_user_room"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="cell",
            name="players_count",
        ),
    ]
