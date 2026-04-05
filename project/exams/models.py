from django.db import models
from django.conf import settings
from subjects.models import Chapter
from questions.models import Question, Choice


class Answer(models.Model):
    """Stores a single student answer for one question."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    selected_choice = models.ForeignKey(
        Choice, on_delete=models.CASCADE, related_name="answers"
    )
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # One answer per student per question per session
        unique_together = ["user", "question"]
        ordering = ["-answered_at"]

    def is_correct(self):
        return self.selected_choice.is_correct

    def __str__(self):
        return f"{self.user.email} → Q{self.question.id} → {'✓' if self.is_correct() else '✗'}"


class Result(models.Model):
    """Final exam result for a student on a chapter."""
    STATUS_CHOICES = (
        ("pass", "Pass"),
        ("fail", "Fail"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="results"
    )
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="results"
    )
    score = models.PositiveIntegerField(help_text="Number of correct answers")
    total = models.PositiveIntegerField(help_text="Total questions attempted")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} | {self.chapter.name} | {self.score}/{self.total} ({self.status})"

    class Meta:
        ordering = ["-attempted_at"]


class RetakeRequest(models.Model):
    """Student request to retake an exam chapter."""
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="retake_requests"
    )
    chapter = models.ForeignKey(
        Chapter, on_delete=models.CASCADE, related_name="retake_requests"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} → {self.chapter.name} [{self.status}]"

    class Meta:
        ordering = ["-requested_at"]
