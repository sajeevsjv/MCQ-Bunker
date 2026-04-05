from django.contrib import admin
from .models import Subject, Chapter


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    search_fields = ["name"]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "subject", "time_limit", "total_questions"]
    list_filter = ["subject"]
    search_fields = ["name"]
