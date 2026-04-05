from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Subject, Chapter
from .serializers import SubjectSerializer, ChapterSerializer, ChapterDetailSerializer
from accounts.permissions import IsAdmin, IsStudent


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


# ─── STUDENT: Chapter endpoints ────────────────────────────────────────────────

class StudentChapterListView(generics.ListAPIView):
    """GET /api/student/chapters/"""
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ChapterDetailSerializer
    queryset = Chapter.objects.select_related("subject").all()
