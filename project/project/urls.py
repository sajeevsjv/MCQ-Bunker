"""
MCQ Question Handling System — Main URL Configuration

Admin API:    /api/admin/...
Student API:  /api/student/...
Shared:       /api/logout/
Django Admin: /admin/
"""

from django.contrib import admin
from django.urls import path

# ── accounts ──────────────────────────────────────────────────────────────────
from accounts.urls import (
    admin_urlpatterns as accounts_admin_urls,
    student_urlpatterns as accounts_student_urls,
    shared_urlpatterns,
)

# ── subjects ──────────────────────────────────────────────────────────────────
from subjects.urls import (
    admin_urlpatterns as subjects_admin_urls,
    student_urlpatterns as subjects_student_urls,
)

# ── questions ─────────────────────────────────────────────────────────────────
from questions.urls import (
    admin_urlpatterns as questions_admin_urls,
    student_urlpatterns as questions_student_urls,
)

# ── exams ─────────────────────────────────────────────────────────────────────
from exams.urls import (
    admin_urlpatterns as exams_admin_urls,
    student_urlpatterns as exams_student_urls,
)

# ─── Assemble URL patterns ────────────────────────────────────────────────────

admin_patterns = (
    accounts_admin_urls
    + subjects_admin_urls
    + questions_admin_urls
    + exams_admin_urls
)

student_patterns = (
    accounts_student_urls
    + subjects_student_urls
    + questions_student_urls
    + exams_student_urls
)

urlpatterns = [
    # Django admin panel
    path("admin/", admin.site.urls),

    # REST API — shared
    *[path(f"api/{p.pattern}", p.callback, name=p.name) for p in shared_urlpatterns],

    # REST API — admin namespace
    *[path(f"api/admin/{p.pattern}", p.callback, name=p.name) for p in admin_patterns],

    # REST API — student namespace
    *[path(f"api/student/{p.pattern}", p.callback, name=p.name) for p in student_patterns],
]
