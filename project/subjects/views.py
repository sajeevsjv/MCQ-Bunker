from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Subject, Chapter
from .serializers import SubjectSerializer, ChapterSerializer, ChapterDetailSerializer
from accounts.permissions import IsAdmin, IsStudent
from exams.models import Result, RetakeRequest


# ─── ADMIN: Subject endpoints ──────────────────────────────────────────────────

class AdminSubjectListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/subjects/ → List all subjects
    POST /api/admin/subjects/ → Create a subject
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()


# ─── ADMIN: Chapter endpoints ──────────────────────────────────────────────────

class AdminChapterCreateView(generics.CreateAPIView):
    """POST /api/admin/chapters/"""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ChapterSerializer
    queryset = Chapter.objects.all()


class AdminChapterUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT    /api/admin/chapters/<id>/
    DELETE /api/admin/chapters/<id>/
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ChapterSerializer
    queryset = Chapter.objects.all()

    def retrieve(self, request, *args, **kwargs):
        # Disable GET on this view — admin uses list from subjects
        return Response(
            {"detail": "Use GET /api/admin/subjects/ to browse."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# ─── STUDENT: Chapter list with retake_status ─────────────────────────────────

class StudentChapterListView(generics.ListAPIView):
    """
    GET /api/student/chapters/

    Returns all chapters. Each chapter includes a `retake_status` field:
      "approved"      → Never attempted. Student can freely take the exam.
      "already_taken" → Exam completed, no retake request sent yet.
      "pending"       → Retake request submitted; waiting for admin decision.
      "approved"      → Admin approved the retake — student can retake.
      "rejected"      → Admin rejected the retake request.
    """
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ChapterDetailSerializer

    def get_queryset(self):
        return Chapter.objects.select_related("subject").all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        user = request.user

        # Set of chapter IDs the student has already attempted
        attempted_ids = set(
            Result.objects.filter(user=user).values_list("chapter_id", flat=True)
        )

        # Map of chapter_id → retake request status (pending / approved / rejected)
        retake_map = {
            rr["chapter_id"]: rr["status"]
            for rr in RetakeRequest.objects.filter(user=user).values("chapter_id", "status")
        }

        data = []
        for chapter in queryset:
            serialized = ChapterDetailSerializer(chapter).data

            # Determine retake_status
            if chapter.id in retake_map:
                retake_status = retake_map[chapter.id]   # "pending" | "approved" | "rejected"
            elif chapter.id in attempted_ids:
                retake_status = "already_taken"           # exam done, no request yet
            else:
                retake_status = "approved"                # default — never attempted

            serialized["retake_status"] = retake_status
            data.append(serialized)

        return Response(data)
