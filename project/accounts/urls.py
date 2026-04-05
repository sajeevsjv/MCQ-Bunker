from django.urls import path
from .views import (
    AdminLoginView,
    StudentLoginView,
    LogoutView,
    StudentCreateView,
    StudentListView,
    StudentUpdateView,
    UserListView,
)

# Admin auth & student management
admin_urlpatterns = [
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("students/", StudentListView.as_view(), name="admin-student-list"),
    path("students/create/", StudentCreateView.as_view(), name="admin-student-create"),
    path("students/<int:pk>/", StudentUpdateView.as_view(), name="admin-student-update"),
    path("users/", UserListView.as_view(), name="admin-user-list"),
]

# Student auth
student_urlpatterns = [
    path("login/", StudentLoginView.as_view(), name="student-login"),
]

# Shared
shared_urlpatterns = [
    path("logout/", LogoutView.as_view(), name="logout"),
]
