from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import (
    LoginSerializer,
    StudentCreateSerializer,
    StudentUpdateSerializer,
    StudentListSerializer,
)
from .permissions import IsAdmin


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ─── POST /api/admin/login/ ───────────────────────────────────────────────────
class AdminLoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if user.role != "admin":
            return Response(
                {"detail": "Admin access only."},
                status=status.HTTP_403_FORBIDDEN,
            )
        tokens = get_tokens_for_user(user)
        return Response(
            {"message": "Admin login successful", "tokens": tokens},
            status=status.HTTP_200_OK,
        )


# ─── POST /api/student/login/ ────────────────────────────────────────────────
class StudentLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if user.role != "student":
            return Response(
                {"detail": "Student access only."},
                status=status.HTTP_403_FORBIDDEN,
            )
        tokens = get_tokens_for_user(user)
        return Response(
            {"message": "Student login successful", "tokens": tokens},
            status=status.HTTP_200_OK,
        )


# ─── POST /api/logout/ ───────────────────────────────────────────────────────
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_200_OK,
            )
        except TokenError:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ─── POST /api/admin/students/ ───────────────────────────────────────────────
class StudentCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = StudentCreateSerializer


# ─── GET /api/admin/students/ ────────────────────────────────────────────────
class StudentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = StudentListSerializer
    queryset = User.objects.filter(role="student")


# ─── PUT /api/admin/students/<id>/ ───────────────────────────────────────────
class StudentUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = StudentUpdateSerializer
    queryset = User.objects.filter(role="student")


# ─── GET /api/admin/users/ ───────────────────────────────────────────────────
class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = StudentListSerializer
    queryset = User.objects.all()
