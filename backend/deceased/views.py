from rest_framework import generics
from .models import DeceasedPerson, Review
from .serializers import DeceasedPersonSerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import DeceasedPerson
from timeline.models import Timeline
from timeline.serializers import TimelineSerializer
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import json
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.http import HttpResponseNotAllowed
from django.views import View
from django.core.files.base import ContentFile
import base64
import requests
from rest_framework.permissions import AllowAny


class DeceasedPersonListCreateView(generics.ListCreateAPIView):
    serializer_class = DeceasedPersonSerializer

    # Allow any user to view deceased persons
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        if self.request.query_params.get("all", "false").lower() == "true":
            return DeceasedPerson.objects.all()
        return DeceasedPerson.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DeceasedPersonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeceasedPerson.objects.all()
    serializer_class = DeceasedPersonSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return DeceasedPerson.objects.prefetch_related("timelines")


class DeceasedPersonCreateView(generics.CreateAPIView):
    queryset = DeceasedPerson.objects.all()
    serializer_class = DeceasedPersonSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )  # Set the logged-in user as the owner of the deceased person


# # View for updating a deceased person's details
# class DeceasedPersonUpdateView(generics.UpdateAPIView):
#     queryset = DeceasedPerson.objects.all()
#     serializer_class = DeceasedPersonSerializer
#     permission_classes = [
#         IsAuthenticated
#     ]  # Ensure that only authenticated users can update

#     def get_queryset(self):
#         # Restrict to deceased profiles added by the logged-in user
#         return DeceasedPerson.objects.filter(user=self.request.user)


class DeceasedPersonUpdateView(generics.UpdateAPIView):
    queryset = DeceasedPerson.objects.all()
    serializer_class = DeceasedPersonSerializer

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        print(request.data)
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Check for file in request.FILES
        if "headshot" in request.FILES:
            request.data["headshot"] = request.FILES["headshot"]

        deceased_serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        deceased_serializer.is_valid(raise_exception=True)
        self.perform_update(deceased_serializer)

        deceased_id = instance.id
        timeline_data = json.loads(request.data.get("timelines", "[]"))

        existing_timeline_ids = set(
            Timeline.objects.filter(deceased=deceased_id).values_list("id", flat=True)
        )

        for index, timeline_item in enumerate(timeline_data):
            timeline_id = timeline_item.get("id")

            # Handle file uploads for each timeline item
            for i in range(1, 4):
                image_key = f"image{i}"
                file_key = f"timelines[{index}][{image_key}]"
                if file_key in request.FILES:
                    timeline_item[image_key] = request.FILES[file_key]
                elif timeline_item.get(image_key) == "new_file":
                    # If 'new_file' is set but no file is found, set to None
                    timeline_item[image_key] = None
                elif timeline_item.get(image_key) and timeline_item[
                    image_key
                ].startswith("http"):
                    # If it's a URL, it means we're keeping the existing image
                    # We don't need to do anything here, as the existing image will be preserved
                    pass
                else:
                    timeline_item[image_key] = None

            if timeline_id:
                try:
                    timeline_instance = Timeline.objects.get(
                        id=timeline_id, deceased=deceased_id
                    )
                    timeline_serializer = TimelineSerializer(
                        timeline_instance, data=timeline_item, partial=True
                    )
                    timeline_serializer.is_valid(raise_exception=True)
                    timeline_serializer.save()
                    existing_timeline_ids.discard(timeline_id)
                except Timeline.DoesNotExist:
                    return Response(
                        {"error": f"Timeline with id {timeline_id} does not exist."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            else:
                timeline_item["deceased"] = deceased_id
                timeline_serializer = TimelineSerializer(data=timeline_item)
                if timeline_serializer.is_valid(raise_exception=True):
                    timeline_serializer.save()

        # Delete timelines that are no longer present in the request
        for timeline_id in existing_timeline_ids:
            Timeline.objects.filter(id=timeline_id).delete()

        return Response(
            {
                "deceased": deceased_serializer.data,
                "timelines": TimelineSerializer(
                    Timeline.objects.filter(deceased=deceased_id), many=True
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticated
    ]  # Only authenticated users can create reviews

    def perform_create(self, serializer):
        # Get the DeceasedPerson object based on the 'pk' passed in the URL
        deceased_id = self.kwargs["pk"]
        deceased = DeceasedPerson.objects.get(id=deceased_id)

        # Save the review with the associated user and deceased person
        serializer.save(created_by=self.request.user, deceased=deceased)


class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    queryset = Review.objects.all()


class ReviewApproveView(generics.UpdateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            approved=False
        )  # Only get reviews that are not approved

    def perform_update(self, serializer):
        # Automatically approve the review during the update
        serializer.save(approved=True)

    def perform_update(self, serializer):
        serializer.instance.approved = True
        serializer.save()


class ReviewDeleteView(View):
    def delete(self, request, pk, *args, **kwargs):
        try:
            # Try to fetch the review by ID (pk)
            review = Review.objects.get(id=pk)

            # Delete the review
            review.delete()

            # Return success response
            return JsonResponse({"message": "Review deleted successfully."}, status=200)

        except Review.DoesNotExist:
            # Return error response if the review does not exist
            return JsonResponse({"error": "Review not found."}, status=404)

        except Exception as e:
            # Handle any other exception
            return JsonResponse({"error": str(e)}, status=500)

    def get(self, request, pk, *args, **kwargs):
        # Return 405 Method Not Allowed if trying to use GET
        return HttpResponseNotAllowed(["DELETE"])
