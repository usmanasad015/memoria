from django.urls import path
from .views import (
    UserListCreateView,
    UserDetailView,
    RegisterView,
    LoginView,
    LogoutView,
)
from .views import ForgotPasswordView, VerifyOTPView, ResetPasswordView
from .views import QueryCreateView, QueryListView, QueryDeleteView
from .views import PartnerUserListView

# from rest_framework.routers import DefaultRouter
# from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("query/", QueryCreateView.as_view(), name="query-create"),
    path("queries/", QueryListView.as_view(), name="query-list"),
    path("queries/<int:pk>/delete/", QueryDeleteView.as_view(), name="query-delete"),
    path("partner-users/", PartnerUserListView.as_view(), name="partner-users"),
]
