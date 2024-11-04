from django.contrib import admin
from .models import Organization, Partner


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "address", "contact_number"]


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "email",
        "organization",
        "contact_number",
    )  # Use 'username' instead of 'name'
    search_fields = ("username", "email")  # Optional: To enable search functionality
