from django.contrib import admin
from .models import Question, Choice


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4
    fields = ["option_text", "is_correct"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["id", "chapter", "question_text"]
    list_filter = ["chapter__subject", "chapter"]
    search_fields = ["question_text"]
    inlines = [ChoiceInline]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ["id", "question", "option_text", "is_correct"]
    list_filter = ["is_correct"]
