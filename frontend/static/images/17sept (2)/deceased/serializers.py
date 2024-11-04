from rest_framework import serializers
from .models import DeceasedPerson, Review
from timeline.models import Timeline


class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeline
        fields = ["id", "event_name", "year", "details", "image1", "image2", "image3"]


class DeceasedPersonSerializer(serializers.ModelSerializer):
    timelines = TimelineSerializer(many=True, read_only=True)

    class Meta:
        model = DeceasedPerson
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "id",
            "textfield1",
            "textfield2",
            "textfield3",
            "imagefield1",
            "imagefield2",
            "imagefield3",
            "approved",
            "created_by",
            "created_at",
            "deceased",
        ]
        read_only_fields = ["created_by", "approved", "created_at", "deceased"]
