from django.urls import path
from .views import (
    AdminQuestionCreateView,
    AdminQuestionUpdateDeleteView,
    StudentChapterQuestionsView,
)

admin_urlpatterns = [
    path("questions/", AdminQuestionCreateView.as_view(), name="admin-question-create"),
    path("questions/<int:pk>/", AdminQuestionUpdateDeleteView.as_view(), name="admin-question-detail"),
]

student_urlpatterns = [
    path("chapters/<int:pk>/questions/", StudentChapterQuestionsView.as_view(), name="student-chapter-questions"),
]
