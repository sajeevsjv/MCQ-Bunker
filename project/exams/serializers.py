from rest_framework import serializers
from .models import Answer, Result, RetakeRequest
from questions.models import Question, Choice


class AnswerSubmitSerializer(serializers.Serializer):
    """Used for POST /api/student/submit-answer/"""
    question_id = serializers.IntegerField()
    selected_choice_id = serializers.IntegerField()

    def validate(self, data):
        try:
            question = Question.objects.get(pk=data["question_id"])
        except Question.DoesNotExist:
            raise serializers.ValidationError({"question_id": "Question not found."})

        try:
            choice = Choice.objects.get(pk=data["selected_choice_id"], question=question)
        except Choice.DoesNotExist:
            raise serializers.ValidationError(
                {"selected_choice_id": "Choice not found or does not belong to this question."}
            )

        data["question"] = question
        data["choice"] = choice
        return data


class ExamSubmitSerializer(serializers.Serializer):
    """Used for POST /api/student/submit-exam/"""
    chapter_id = serializers.IntegerField()


class AnswerDetailSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.question_text", read_only=True)
    selected_option = serializers.CharField(source="selected_choice.option_text", read_only=True)
    is_correct = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ["id", "question_text", "selected_option", "is_correct", "answered_at"]

    def get_is_correct(self, obj):
        return obj.selected_choice.is_correct


class ResultSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(source="chapter.name", read_only=True)
    subject_name = serializers.CharField(source="chapter.subject.name", read_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            "id", "chapter_name", "subject_name",
            "score", "total", "percentage", "status", "attempted_at"
        ]

    def get_percentage(self, obj):
        if obj.total == 0:
            return 0
        return round((obj.score / obj.total) * 100, 1)


class RetakeRequestSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(source="chapter.name", read_only=True)
    student_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = RetakeRequest
        fields = ["id", "student_email", "chapter", "chapter_name", "status", "requested_at", "updated_at"]
        read_only_fields = ["id", "student_email", "chapter_name", "requested_at", "updated_at"]


class RetakeRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetakeRequest
        fields = ["id", "chapter", "status", "requested_at"]
        read_only_fields = ["id", "status", "requested_at"]


class RetakeRequestPatchSerializer(serializers.ModelSerializer):
    """Admin use — only updates status."""
    class Meta:
        model = RetakeRequest
        fields = ["id", "status"]
