# from rest_framework import serializers
# from .models import User
# from django.contrib.auth.password_validation import validate_password
# from django.contrib.auth.models import Permission
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'contact_number', 'address', 'tier', 'role', 'profile_picture']


# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
#     password2 = serializers.CharField(write_only=True, required=True)
#     role = serializers.CharField(required=False, default=User.USER)

#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password', 'password2', 'role']

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({"password": "Password fields didn't match."})
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop('password2')
#         role = validated_data.pop('role', User.USER)

#         try:
#             user = User.objects.create(
#                 username=validated_data['username'],
#                 email=validated_data['email'],
#                 role=role,
#                 is_active=True,
#             )
#             user.set_password(validated_data['password'])
#             user.save()

#             if role == User.ADMIN:
#                 user.user_permissions.set(Permission.objects.all())
#             else:
#                 user.user_permissions.clear()

#             return user
#         except Exception as e:
#             raise serializers.ValidationError({"error": f"User creation failed: {str(e)}"})


# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         token['role'] = user.role
#         return token

#     def validate(self, attrs):
#         data = super().validate(attrs)

#         data['role'] = self.user.role
#         return data


from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import Permission
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Query


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "contact_number",
            "address",
            "tier",
            "role",
            "profile_picture",
            "shipping_address",
            "organization",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(
        required=False, default=User.USER
    )  # Set role to optional with default

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password2",
            "role",
            "profile_picture",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        role = validated_data.pop(
            "role", User.USER
        )  # Default to 'user' if role is not provided

        # Extract the profile picture from the validated data
        profile_picture = validated_data.pop("profile_picture", None)

        try:
            # Create the user with the remaining data
            user = User.objects.create(
                username=validated_data["username"],
                email=validated_data["email"],
                role=role,
                is_active=True,
                is_staff=(role == User.ADMIN),  # Only admins should be staff by default
                profile_picture=profile_picture,  # Assign the profile picture to the user
            )
            user.set_password(validated_data["password"])
            user.save()

            # Assign permissions based on the role
            if role == User.ADMIN:
                user.user_permissions.set(
                    Permission.objects.all()
                )  # Grant all permissions to admin
            else:
                user.user_permissions.clear()  # Clear permissions for non-admin users

            return user
        except Exception as e:
            raise serializers.ValidationError(
                {"error": f"User creation failed: {str(e)}"}
            )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["role"] = user.role  # Add role to the token payload
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user role and other custom fields to the response
        data["role"] = self.user.role
        data["id"] = self.user.id

        # Check if the user has a profile picture and return its URL if available
        if self.user.profile_picture:
            data["profile_picture"] = self.user.profile_picture.url  # Get the image URL
        else:
            data["profile_picture"] = None  # Set it to None if no profile picture

        return data


# Serializers for Forgot Password Workflow


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            user.generate_otp()  # Generate OTP and save to the user
            send_mail(
                "Your OTP for Password Reset",
                f"Your OTP is {user.otp}. It is valid for 5 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
            if not user.otp_is_valid() or user.otp != data["otp"]:
                raise serializers.ValidationError("Invalid or expired OTP.")
            return data
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
            if not user.otp_is_valid() or user.otp != data["otp"]:
                raise serializers.ValidationError("Invalid or expired OTP.")
            return data
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

    def save(self):
        email = self.validated_data["email"]
        new_password = self.validated_data["new_password"]
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.otp = None  # Clear OTP after successful password reset
        user.otp_created_at = None
        user.save()


class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ["id", "name", "email", "query_text"]
