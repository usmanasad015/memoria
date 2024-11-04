from rest_framework import generics
from .models import Timeline, DeceasedTimeline
from .serializers import (
    TimelineSerializer,
    DeceasedTimelineSerializer,
    FamilyAlbumSerializer,
)
from rest_framework.response import Response
import json
from rest_framework import status
from deceased.models import DeceasedPerson
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import FamilyAlbum


# from rest_framework.status import status


class TimelineListCreateView(generics.ListCreateAPIView):
    queryset = Timeline.objects.all()
    serializer_class = TimelineSerializer

    def create(self, request, *args, **kwargs):
        deceased_id = request.data.get("deceased")
        if not deceased_id:
            return Response(
                {"error": "Deceased ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        timelines_data = []
        index = 0
        while True:
            event_name = request.data.get(f"event_name[{index}]")
            if not event_name:
                break

            timeline_data = {
                "deceased": deceased_id,
                "event_name": event_name,
                "year": request.data.get(f"year[{index}]"),
                "details": request.data.get(f"details[{index}]"),
                "image1": request.FILES.get(f"image1[{index}]"),
                "image2": request.FILES.get(f"image2[{index}]"),
                "image3": request.FILES.get(f"image3[{index}]"),
            }
            timelines_data.append(timeline_data)
            index += 1

        serializer = self.get_serializer(data=timelines_data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        serializer.save()


class DeceasedTimelineCreateView(generics.CreateAPIView):
    queryset = DeceasedTimeline.objects.all()
    serializer_class = DeceasedTimelineSerializer


class TimelineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Timeline.objects.all()
    serializer_class = TimelineSerializer


class DeceasedTimelineListCreateView(generics.ListCreateAPIView):
    queryset = DeceasedTimeline.objects.all()
    serializer_class = DeceasedTimelineSerializer

    def perform_create(self, serializer):
        deceased_id = self.request.data.get("deceased")  # Get deceased_id from request
        serializer.save(deceased_id=deceased_id)


class DeceasedTimelineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeceasedTimeline.objects.all()
    serializer_class = DeceasedTimelineSerializer


class DeceasedTimelineAPIView(APIView):
    # Remove authentication by explicitly setting permission_classes to an empty list
    permission_classes = [AllowAny]

    def get(self, request, deceased_id):
        try:
            deceased = DeceasedPerson.objects.get(id=deceased_id)
            timelines = Timeline.objects.filter(deceased=deceased)
            serializer = TimelineSerializer(timelines, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DeceasedPerson.DoesNotExist:
            return Response(
                {"error": "Deceased person not found"}, status=status.HTTP_404_NOT_FOUND
            )


class FamilyAlbumListCreateView(generics.ListCreateAPIView):
    serializer_class = FamilyAlbumSerializer

    def get_queryset(self):
        deceased_id = self.kwargs.get("deceased_id")
        if deceased_id:
            return FamilyAlbum.objects.filter(deceased_id=deceased_id)
        return FamilyAlbum.objects.all()

    def perform_create(self, serializer):
        deceased_id = self.request.data.get("deceased")
        images = self.request.FILES.getlist(
            "image[]"
        )  # Updated to match the payload key

        if not images:
            return Response(
                {"error": "No images provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        family_album_entries = []

        for image in images:
            # Create a FamilyAlbum entry for each image
            family_album_entries.append(
                FamilyAlbum(deceased_id=deceased_id, image=image)
            )

        # Bulk create the FamilyAlbum entries
        FamilyAlbum.objects.bulk_create(family_album_entries)


class FamilyAlbumListView(generics.ListAPIView):
    serializer_class = FamilyAlbumSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        deceased_id = self.kwargs["deceased_id"]
        return FamilyAlbum.objects.filter(deceased_id=deceased_id)
