# from django.db import models
# from django.contrib.auth.models import AbstractUser

# class User(AbstractUser):
#     USER = 'user'
#     PARTNER = 'partner'
#     ADMIN = 'admin'

#     ROLE_CHOICES = [
#         (USER, 'User'),
#         (PARTNER, 'Partner'),
#         (ADMIN, 'Admin'),
#     ]

#     # Existing fields from your User model
#     contact_number = models.CharField(max_length=15, null=True, blank=True)
#     address = models.TextField(null=True, blank=True)
#     tier = models.IntegerField(choices=[(1, 'free'), (2, 'premium'), (3, 'enterprise')], default=1)
#     partner = models.ForeignKey('partners.Partner', on_delete=models.CASCADE, null=True, blank=True)
#     profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

#     # New role field to differentiate between User, Partner, and Admin
#     role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=USER)

#     groups = models.ManyToManyField(
#         'auth.Group',
#         related_name='custom_user_set',
#         blank=True
#     )
#     user_permissions = models.ManyToManyField(
#         'auth.Permission',
#         related_name='custom_user_permissions_set',
#         blank=True
#     )

#     def __str__(self):
#         return self.username


# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timedelta
import random
from django.utils import timezone


class User(AbstractUser):
    USER = "user"
    PARTNER = "partner"
    ADMIN = "admin"

    TIER_CHOICES = [
        ("free", "Free"),
        ("premium", "Premium"),
        ("enterprise", "Enterprise"),
    ]

    ROLE_CHOICES = [(USER, "User"), (PARTNER, "Partner"), (ADMIN, "Admin")]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=USER)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    shipping_address = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    tier = models.CharField(
        max_length=50, choices=TIER_CHOICES, default="free", blank=True, null=True
    )
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    # partner = models.ForeignKey('partners.Partner', on_delete=models.SET_NULL, blank=True, null=True)
    partner = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_users",
    )  # Add this if it's not there
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.SET_NULL, null=True, blank=True
    )

    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.otp_created_at = datetime.now()
        self.save()

    def otp_is_valid(self):
        if self.otp_created_at:
            now = timezone.now()
            expiry_time = self.otp_created_at + timedelta(minutes=5)
            return now < expiry_time
        return False


class Query(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    query_text = models.TextField()

    def __str__(self):
        return self.name
