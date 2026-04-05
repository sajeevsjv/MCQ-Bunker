from django.db import models


class Subject(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Chapter(models.Model):
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="chapters"
    )
    name = models.CharField(max_length=255)
    time_limit = models.PositiveIntegerField(help_text="Time limit in minutes")
    total_questions = models.PositiveIntegerField(
        help_text="Number of questions shown per exam attempt"
    )

    def __str__(self):
        return f"{self.subject.name} → {self.name}"

    class Meta:
        ordering = ["subject", "name"]
        unique_together = ["subject", "name"]
