# Generated by Django 4.2 on 2024-03-02 08:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0005_alter_user_room"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="pos",
            field=models.PositiveIntegerField(),
        ),
    ]
