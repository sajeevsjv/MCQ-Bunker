from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Answer, Result, RetakeRequest
from .serializers import (
    AnswerSubmitSerializer,
    ExamSubmitSerializer,
    AnswerDetailSerializer,
    ResultSerializer,
    RetakeRequestSerializer,
    RetakeRequestCreateSerializer,
    RetakeRequestPatchSerializer,
)
from subjects.models import Chapter
from accounts.permissions import IsAdmin, IsStudent

# Pass threshold — student needs >= 60% to pass
PASS_THRESHOLD = 0.60


# ─── STUDENT: Submit single answer ────────────────────────────────────────────
class SubmitAnswerView(APIView):
    """
    POST /api/student/submit-answer/
    Body: { question_id, selected_choice_id }

    Saves or updates the student's answer for a question.
    Returns whether the answer was correct (after recording it).
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = AnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]
        choice = serializer.validated_data["choice"]

        # Check if student already answered this question — update if so
        answer, created = Answer.objects.update_or_create(
            user=request.user,
            question=question,
            defaults={"selected_choice": choice},
        )

        return Response(
            {
                "message": "Answer saved." if created else "Answer updated.",
                "question_id": question.id,
                "selected_choice_id": choice.id,
                "is_correct": choice.is_correct,
            },
            status=status.HTTP_200_OK,
        )


# ─── STUDENT: Submit exam (finalize & calculate score) ────────────────────────
class SubmitExamView(APIView):
    """
    POST /api/student/submit-exam/
    Body: { chapter_id }

    Calculates score from already submitted answers for this chapter.
    Saves Result. Student must not have an existing pending result
    (retake blocking logic).
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = ExamSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chapter = get_object_or_404(Chapter, pk=serializer.validated_data["chapter_id"])

        # Retake blocking: check if student has an existing result and
        # no approved retake request
        existing_result = Result.objects.filter(
            user=request.user, chapter=chapter
        ).first()

        if existing_result:
            approved_retake = RetakeRequest.objects.filter(
                user=request.user,
                chapter=chapter,
                status="approved",
            ).exists()
            if not approved_retake:
                return Response(
                    {
                        "detail": (
                            "You have already attempted this exam. "
                            "Please request a retake and wait for admin approval."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Consume the approved retake (set to 'used' concept → delete it)
            RetakeRequest.objects.filter(
                user=request.user, chapter=chapter, status="approved"
            ).delete()

        # Collect all answers submitted for this chapter's questions
        answers = Answer.objects.filter(
            user=request.user,
            question__chapter=chapter,
        ).select_related("selected_choice")

        total = answers.count()
        if total == 0:
            return Response(
                {"detail": "No answers found for this chapter. Please submit answers first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct_count = sum(1 for a in answers if a.selected_choice.is_correct)

        # Determine pass/fail
        percentage = correct_count / total
        result_status = "pass" if percentage >= PASS_THRESHOLD else "fail"

        # Save result
        result = Result.objects.create(
            user=request.user,
            chapter=chapter,
            score=correct_count,
            total=total,
            status=result_status,
        )

        # Clear submitted answers after exam finalized
        Answer.objects.filter(user=request.user, question__chapter=chapter).delete()

        return Response(
            {
                "message": "Exam submitted successfully.",
                "chapter": chapter.name,
                "score": correct_count,
                "total": total,
                "percentage": round(percentage * 100, 1),
                "status": result_status,
                "result_id": result.id,
            },
            status=status.HTTP_201_CREATED,
        )


# ─── STUDENT: View own results ─────────────────────────────────────────────────
class StudentResultListView(generics.ListAPIView):
    """GET /api/student/results/"""
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ResultSerializer

    def get_queryset(self):
        return Result.objects.filter(user=self.request.user).select_related(
            "chapter", "chapter__subject"
        )


# ─── STUDENT: Request retake ───────────────────────────────────────────────────
class StudentRetakeRequestView(APIView):
    """
    POST /api/student/retake-request/
    Body: { chapter }
    Creates a retake request only if student has a failed result.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = RetakeRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        chapter = serializer.validated_data["chapter"]

        # Must have a previous result for this chapter
        has_result = Result.objects.filter(
            user=request.user, chapter=chapter
        ).exists()
        if not has_result:
            return Response(
                {"detail": "No exam result found for this chapter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for duplicate pending request
        existing = RetakeRequest.objects.filter(
            user=request.user, chapter=chapter, status="pending"
        ).exists()
        if existing:
            return Response(
                {"detail": "You already have a pending retake request for this chapter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        retake = RetakeRequest.objects.create(
            user=request.user,
            chapter=chapter,
            status="pending",
        )
        return Response(
            RetakeRequestCreateSerializer(retake).data,
            status=status.HTTP_201_CREATED,
        )


# ─── ADMIN: List all retake requests ──────────────────────────────────────────
class AdminRetakeRequestListView(generics.ListAPIView):
    """GET /api/admin/retake-requests/"""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = RetakeRequestSerializer
    queryset = RetakeRequest.objects.select_related("user", "chapter").all()


# ─── ADMIN: Approve / Reject retake request ────────────────────────────────────
class AdminRetakeRequestPatchView(generics.UpdateAPIView):
    """
    PATCH /api/admin/retake-requests/<id>/
    Body: { status: "approved" | "rejected" }
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = RetakeRequestPatchSerializer
    queryset = RetakeRequest.objects.all()
    http_method_names = ["patch", "options", "head"]


# ─── ADMIN: All results ────────────────────────────────────────────────────────
class AdminResultListView(generics.ListAPIView):
    """GET /api/admin/results/"""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ResultSerializer
    queryset = Result.objects.select_related(
        "user", "chapter", "chapter__subject"
    ).all()

    def get_serializer_class(self):
        return ResultSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for result in queryset:
            s = ResultSerializer(result).data
            s["student_email"] = result.user.email
            data.append(s)
        return Response(data)
