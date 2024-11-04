from rest_framework import serializers
from .models import Timeline, DeceasedTimeline


# class TimelineSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Timeline
#         fields = [
#             "event_name",
#             "details",
#             "image1",
#             "image2",
#             "image3",
#             "year",
#             "deceased",
#         ]  # Include deceased_id


class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeline
        fields = [
            "id",
            "event_name",
            "details",
            "image1",
            "image2",
            "image3",
            "year",
            "deceased",
        ]

    def create(self, validated_data):
        return Timeline.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class DeceasedTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeceasedTimeline
        fields = "__all__"

    def create(self, validated_data):
        timelines_data = validated_data.pop("timelines")
        deceased_timeline = DeceasedTimeline.objects.create(**validated_data)

        # Create multiple timelines and associate with the deceased person
        for timeline_data in timelines_data:
            timeline = Timeline.objects.create(**timeline_data)
            DeceasedTimeline.objects.create(
                deceased=deceased_timeline.deceased, timeline=timeline
            )

        return deceased_timeline
