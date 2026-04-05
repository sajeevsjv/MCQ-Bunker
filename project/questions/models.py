from django.db import models
from subjects.models import Chapter


class Question(models.Model):
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="questions"
    )
    question_text = models.TextField()

    def __str__(self):
        return f"[{self.chapter.name}] {self.question_text[:60]}"

    class Meta:
        ordering = ["id"]


class Choice(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="choices"
    )
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        marker = "✓" if self.is_correct else "✗"
        return f"{marker} {self.option_text[:60]}"

    class Meta:
        ordering = ["id"]
