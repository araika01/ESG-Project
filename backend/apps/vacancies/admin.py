from django.contrib import admin
from .models import Vacancy, Favorite

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ['title', 'employer', 'location', 'status', 'duration', 'created_at']
    list_filter = ['status', 'duration', 'is_remote', 'replacement_reason']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'created_at'

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'vacancy', 'created_at']