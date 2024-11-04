from rest_framework import generics
from rest_framework.generics import DestroyAPIView
from .models import Organization, Partner
from .serializers import OrganizationSerializer, PartnerSerializer

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError


class OrganizationListCreateView(generics.ListCreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer


class PartnerListCreateView(generics.ListCreateAPIView):
    serializer_class = PartnerSerializer

    def get_queryset(self):
        return Partner.objects.all()

    def perform_create(self, serializer):
        organization_id = self.kwargs["organization_id"]
        organization = Organization.objects.get(pk=organization_id)
        serializer.save(organization=organization)


class PartnerDeleteView(DestroyAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    lookup_field = "pk"


@method_decorator(csrf_exempt, name="dispatch")
class RegisterPartnerView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        organization = data.get("organization")
        contact_number = data.get("contact_number")
        shipping_address = data.get("shipping_address")

        UserModel = get_user_model()

        # Check if the username or email already exists
        if UserModel.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already exists"}, status=400)

        if UserModel.objects.filter(email=email).exists():
            return JsonResponse({"message": "Email already exists"}, status=400)

        try:
            user = UserModel.objects.create_user(
                username=username, email=email, password=password
            )
            user.role = "partner"  # Assuming you have a role field in your UserModel
            user.organization_id = organization
            user.contact_number = contact_number
            user.shipping_address = shipping_address
            user.save()

            return JsonResponse({"message": "User created successfully"})
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)


class PartnerListView(generics.ListAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
