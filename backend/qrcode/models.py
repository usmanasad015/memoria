from django.db import models
from partners.models import Partner  # Import Partner from your partner app
from django.conf import settings  # Ensure this import is present
from django.contrib.auth import get_user_model  # Import the user model


class QRCode(models.Model):
    STATUS_CHOICES = (
        ("unassigned", "Unassigned"),
        ("assigned", "Assigned"),
        ("delivered", "Delivered"),
    )
    id = models.AutoField(primary_key=True)
    hovercode_id = models.CharField(max_length=100, unique=True)
    partner = models.ForeignKey(
        Partner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="qr_codes",
    )
    deceased_id = models.CharField(max_length=100, null=True, blank=True)
    url = models.URLField(default="https://memoria.com")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="unassigned"
    )
    partner = models.ForeignKey(
        get_user_model(),  # Use the User model
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="qr_codes",
    )

    def __str__(self):
        return f"QR Code {self.hovercode_id}"
