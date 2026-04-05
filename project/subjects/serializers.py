from rest_framework import serializers
from .models import Subject, Chapter


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name"]


class ChapterSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Chapter
        fields = ["id", "subject", "subject_name", "name", "time_limit", "total_questions"]


class ChapterDetailSerializer(serializers.ModelSerializer):
    """For student view — hides internal config details."""
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = Chapter
        fields = ["id", "subject_name", "name", "time_limit", "total_questions"]
