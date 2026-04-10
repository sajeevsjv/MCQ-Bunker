from django.urls import path
from .views import (
    AdminSubjectListCreateView,
    AdminChapterCreateView,
    AdminChapterUpdateDeleteView,
    StudentChapterListView,
    StudentSubjectList
)

admin_urlpatterns = [
    path("subjects/", AdminSubjectListCreateView.as_view(), name="admin-subject-list-create"),
    path("chapters/", AdminChapterCreateView.as_view(), name="admin-chapter-create"),
    path("chapters/<int:pk>/", AdminChapterUpdateDeleteView.as_view(), name="admin-chapter-detail"),
]

student_urlpatterns = [
    path("chapters/<int:subject_id>/", StudentChapterListView.as_view(), name="student-chapter-list"),
    path("subjects/",StudentSubjectList,name="student subjects")
]
