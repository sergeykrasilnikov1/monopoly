# Generated by Django 4.2.5 on 2023-10-02 16:11

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("presence", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Player",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("active", models.IntegerField(default=20000)),
                ("passive", models.IntegerField(default=20000)),
                ("color", models.PositiveIntegerField(default=0)),
                ("pos", models.PositiveIntegerField(default=0)),
            ],
        ),
    ]