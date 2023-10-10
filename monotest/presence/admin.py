from django.contrib import admin
from presence.models import User, Room, Cell

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username',)

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    pass

@admin.register(Cell)
class RoomAdmin(admin.ModelAdmin):
    pass
