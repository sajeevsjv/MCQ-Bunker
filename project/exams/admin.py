from django.contrib import admin
from .models import Answer, Result, RetakeRequest


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "question", "selected_choice", "answered_at"]
    list_filter = ["question__chapter"]


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "chapter", "score", "total", "status", "attempted_at"]
    list_filter = ["status", "chapter__subject"]
    search_fields = ["user__email"]


@admin.register(RetakeRequest)
class RetakeRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "chapter", "status", "requested_at"]
    list_filter = ["status"]
    search_fields = ["user__email"]
