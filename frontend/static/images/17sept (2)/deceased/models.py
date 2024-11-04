from django.db import models
from users.models import User


class DeceasedPerson(models.Model):
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    date_of_death = models.DateField()
    date_of_burial = models.DateField(null=True, blank=True)
    relationship_with_deceased = models.CharField(max_length=255, null=True, blank=True)
    headshot = models.ImageField(upload_to="deceased/", null=True, blank=True)
    voice_recording = models.FileField(
        upload_to="deceased/voice/", null=True, blank=True
    )
    about = models.TextField(null=True, blank=True)
    quote = models.TextField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    profile_url = models.URLField(default="https://memoria.com")

    def __str__(self):
        return self.name


class Review(models.Model):
    deceased = models.ForeignKey(
        DeceasedPerson, related_name="reviews", on_delete=models.CASCADE
    )
    textfield1 = models.TextField(null=True, blank=True)  # First text field
    textfield2 = models.TextField(null=True, blank=True)  # Second text field
    textfield3 = models.TextField(null=True, blank=True)  # Third text field
    imagefield1 = models.ImageField(
        upload_to="reviews/images/", null=True, blank=True
    )  # First image field
    imagefield2 = models.ImageField(
        upload_to="reviews/images/", null=True, blank=True
    )  # Second image field
    imagefield3 = models.ImageField(
        upload_to="reviews/images/", null=True, blank=True
    )  # Third image field
    approved = models.BooleanField(default=False)  # Approval status
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE
    )  # The user who added the review
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"Review by {self.created_by.username} for {self.deceased.name}"
