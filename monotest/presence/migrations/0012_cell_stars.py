# Generated by Django 4.2.5 on 2023-10-08 06:54

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("presence", "0011_remove_cell_build_cost"),
    ]

    operations = [
        migrations.AddField(
            model_name="cell",
            name="stars",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
