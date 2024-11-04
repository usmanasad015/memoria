from django.db import models
from deceased.models import DeceasedPerson
from django.core.validators import MinValueValidator, MaxValueValidator
import datetime


class Timeline(models.Model):
    event_name = models.CharField(max_length=255, null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    image1 = models.ImageField(upload_to="timeline/", null=True, blank=True)
    image2 = models.ImageField(upload_to="timeline/", null=True, blank=True)
    image3 = models.ImageField(upload_to="timeline/", null=True, blank=True)
    year = models.IntegerField(
        validators=[
            MinValueValidator(1900),  # Minimum year restriction
            MaxValueValidator(
                datetime.datetime.now().year
            ),  # Maximum year restricted to current year
        ],
        null=True,
        blank=True,
    )

    deceased = models.ForeignKey(
        DeceasedPerson,
        on_delete=models.CASCADE,
        null=True,
    )  # Allow null temporarily

    def __str__(self):
        return self.event_name


class DeceasedTimeline(models.Model):
    timeline = models.ForeignKey(
        Timeline, on_delete=models.CASCADE
    )  # Link to a timeline
    deceased = models.ForeignKey(
        DeceasedPerson, on_delete=models.CASCADE, related_name="timelines"
    )  # Link to a deceased person

    def __str__(self):
        return f"{self.timeline.event_name} - {self.deceased.name}"
