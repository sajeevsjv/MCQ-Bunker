from django.urls import path
from .views import (
    SubmitAnswerView,
    SubmitExamView,
    StudentResultListView,
    StudentRetakeRequestView,
    AdminRetakeRequestListView,
    AdminRetakeRequestPatchView,
    AdminResultListView,
)

admin_urlpatterns = [
    path("results/", AdminResultListView.as_view(), name="admin-result-list"),
    path("retake-requests/", AdminRetakeRequestListView.as_view(), name="admin-retake-list"),
    path("retake-requests/<int:pk>/", AdminRetakeRequestPatchView.as_view(), name="admin-retake-patch"),
]

student_urlpatterns = [
    path("submit-answer/", SubmitAnswerView.as_view(), name="student-submit-answer"),
    path("submit-exam/", SubmitExamView.as_view(), name="student-submit-exam"),
    path("results/", StudentResultListView.as_view(), name="student-result-list"),
    path("retake-request/", StudentRetakeRequestView.as_view(), name="student-retake-request"),
]
