from django.contrib import admin
from server.models import User, Room, Cell

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    pass

@admin.register(Cell)
class RoomAdmin(admin.ModelAdmin):
    pass
