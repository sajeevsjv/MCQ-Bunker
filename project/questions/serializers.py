from rest_framework import serializers
from .models import Question, Choice


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "option_text", "is_correct"]


class ChoiceStudentSerializer(serializers.ModelSerializer):
    """Student-facing choice — hides is_correct to prevent cheating."""
    class Meta:
        model = Choice
        fields = ["id", "option_text"]


class QuestionSerializer(serializers.ModelSerializer):
    """Admin read serializer — includes correct answer flag."""
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "chapter", "question_text", "choices"]


class QuestionStudentSerializer(serializers.ModelSerializer):
    """Student-facing — hides is_correct on choices."""
    choices = ChoiceStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "question_text", "choices"]


class ChoiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["option_text", "is_correct"]


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Admin write serializer — accepts nested choices on create/update."""
    choices = ChoiceWriteSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "chapter", "question_text", "choices"]

    def validate_choices(self, choices):
        correct = [c for c in choices if c.get("is_correct")]
        if len(correct) == 0:
            raise serializers.ValidationError(
                "At least one choice must be marked as correct."
            )
        if len(correct) > 1:
            raise serializers.ValidationError(
                "Only one choice should be marked as correct."
            )
        if len(choices) < 2:
            raise serializers.ValidationError(
                "A question must have at least 2 choices."
            )
        return choices

    def create(self, validated_data):
        choices_data = validated_data.pop("choices")
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop("choices", None)
        instance.question_text = validated_data.get("question_text", instance.question_text)
        instance.chapter = validated_data.get("chapter", instance.chapter)
        instance.save()
        if choices_data is not None:
            # Replace all choices on update
            instance.choices.all().delete()
            for choice_data in choices_data:
                Choice.objects.create(question=instance, **choice_data)
        return instance
