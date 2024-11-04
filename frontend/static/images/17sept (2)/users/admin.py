# admin.py
from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from partners.models import Partner


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(widget=forms.PasswordInput(), label="Password")
    password2 = forms.CharField(widget=forms.PasswordInput(), label="Confirm Password")

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password1",
            "password2",
            "contact_number",
            "address",
            "tier",
            "partner",
            "profile_picture",
            "role",
        )

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])

        if user.role in [User.PARTNER, User.ADMIN]:
            user.is_staff = True
            if user.role == User.ADMIN:
                user.is_superuser = True

        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "contact_number",
            "address",
            "tier",
            "partner",
            "profile_picture",
            "role",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["partner"].queryset = Partner.objects.all()


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    list_display = (
        "username",
        "email",
        "contact_number",
        "tier",
        "partner",
        "role",
        "is_active",
        "is_staff",
    )
    search_fields = ("username", "email", "contact_number")
    ordering = ("username",)
    filter_horizontal = ()

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "contact_number",
                    "address",
                    "tier",
                    "partner",
                    "profile_picture",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "user_permissions",
                    "groups",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "password1",
                    "password2",
                    "contact_number",
                    "address",
                    "tier",
                    "partner",
                    "profile_picture",
                    "role",
                ),
            },
        ),
    )


admin.site.register(User, UserAdmin)
