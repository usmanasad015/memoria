from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import Permission  # Add this import
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework import generics
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated

from rest_framework import generics
from .models import Query
from .serializers import QuerySerializer
from rest_framework.generics import ListAPIView, DestroyAPIView

# from .models import Partner
# from .serializers import PartnerSerializer
# from .permissions import IsAdmin, IsPartnerOrAdmin


from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import (
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_active=True)
        user.is_staff = True

        # Convert permission names to permission objects
        permissions = Permission.objects.filter(
            codename__in=[perm.split(".")[1] for perm in user.get_all_permissions()]
        )

        # Set permission objects to user
        user.user_permissions.set(permissions)
        user.save()

        self.send_registration_email(user)

    def send_registration_email(self, user):
        subject = "Welcome to Memoria App!"
        message = (
            f"Hello {user.username},\n\n"
            "You have successfully registered for the Memoria App with this email address. "
            "Tap the link below to log in to your account:\n\n"
            "http://127.0.0.1:8000/api/login/  # Update with your actual login URL\n\n"
            "Thank you for joining Memoria!\n\n"
            "Best Regards,\n"
            "The Memoria Team"
        )

        recipient_list = [user.email]
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")  # Expecting 'email' instead of 'username'
        password = request.data.get("password")
        print(f"Attempting to authenticate user: {email}")

        try:
            user = User.objects.get(email=email)  # Get user by email
        except User.DoesNotExist:
            print("Invalid credentials")
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )

        if user.check_password(password):  # Verify password
            print(f"User authenticated: {user.username}")
            login(request, user)

            # Check user role to determine dashboard
            if user.role == User.ADMIN:
                dashboard = "admin_dashboard"
            elif user.role == User.PARTNER:
                dashboard = "partner_dashboard"
            else:
                dashboard = "main_dashboard"

            return Response(
                {
                    "message": "Logged in successfully!",
                    "role": user.role,
                    "dashboard": dashboard,
                }
            )

        print("Invalid credentials")
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
            return Response(
                {"message": "Logged out successfully!"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "User is not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# # View to create partners (only Admins can access this)
# class PartnerCreateView(generics.CreateAPIView):
#     queryset = Partner.objects.all()
#     serializer_class = PartnerSerializer
#     permission_classes = [IsAdmin]

# # View to create users (Partners and Admins can access this)
# class UserCreateView(generics.CreateAPIView):
#     queryset = User.objects.filter(role=User.USER)
#     serializer_class = UserSerializer
#     permission_classes = [IsPartnerOrAdmin]


class ForgotPasswordView(generics.GenericAPIView):
    """
    View to handle sending OTP to the user's email for password reset.
    """

    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "OTP sent to your email."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(generics.GenericAPIView):
    """
    View to handle OTP verification for password reset.
    """

    serializer_class = VerifyOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "OTP verified. You can now reset your password."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(generics.GenericAPIView):
    """
    View to handle resetting the password after OTP verification.
    """

    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password reset successful."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QueryCreateView(generics.CreateAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer


class QueryListView(ListAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer


class QueryDeleteView(DestroyAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer
    lookup_field = "pk"


class PartnerUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "partner":  # Assuming you have a 'role' field for the user
            return User.objects.filter(partner=user)
        return User.objects.none()  # If not a partner, return no users
