from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from .models import QRCode  # Ensure both models are imported
from deceased.models import DeceasedPerson
from .serializers import QRCodeSerializer
from partners.models import Partner
import requests
import csv
from django.http import HttpResponse
from django.core.mail import send_mail
from django.contrib.auth import get_user_model  # Import User model
from users.models import User  # Import User model
from rest_framework.permissions import IsAuthenticated
from .utils import update_qrcode_with_deceased

from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import QRCode
from deceased.models import DeceasedPerson
from rest_framework.views import APIView


class QRCodeViewSet(viewsets.ModelViewSet):
    queryset = QRCode.objects.all()
    serializer_class = QRCodeSerializer

    @action(detail=False, methods=["post"])
    def create_bulk(self, request):
        # Admin can specify the number of QR codes to generate; default is 100.
        number_of_qr_codes = request.data.get("number_of_qr_codes", 100)
        created_qr_codes = []

        for _ in range(number_of_qr_codes):
            response = requests.post(
                "https://hovercode.com/api/v2/hovercode/create/",
                headers={"Authorization": f"Token {settings.HOVERCODE_API_TOKEN}"},
                json={
                    "workspace": settings.HOVERCODE_WORKSPACE_ID,
                    "qr_data": settings.DEFAULT_QR_URL,  # Default URL for QR code
                    "dynamic": True,
                },
            )

            if response.status_code == 200:
                hovercode_data = response.json()
                # Create the QR code instance with default values for partner and deceased
                qr_code = QRCode.objects.create(
                    hovercode_id=hovercode_data["id"],
                    url=settings.DEFAULT_QR_URL,
                    status="unassigned",  # Initially set to unassigned
                )
                created_qr_codes.append(QRCodeSerializer(qr_code).data)

        # Return the created QR codes
        return Response(created_qr_codes)

    @action(detail=False, methods=["get"])
    def bulk_download(self, request):
        # Number of QR codes to download is specified by the admin, default is 100
        number_of_qr_codes = int(request.GET.get("number_of_qr_codes", 100))

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="qrcodes.csv"'

        writer = csv.writer(response)
        writer.writerow(
            ["ID", "Hovercode ID", "Status", "Partner", "Deceased"]
        )  # CSV header

        qr_codes_to_download = QRCode.objects.filter(status="unassigned")[
            :number_of_qr_codes
        ]

        for qr_code in qr_codes_to_download:
            writer.writerow(
                [
                    qr_code.id,
                    qr_code.hovercode_id,
                    qr_code.status,
                    qr_code.partner.name if qr_code.partner else "None",
                    qr_code.deceased.name if qr_code.deceased else "None",
                ]
            )

        return response

        # ----------------------------------

    @action(detail=True, methods=["post"], url_path="assign_partner")
    def assign_partner(self, request, pk=None):
        qrcode = self.get_object()
        partner_id = request.data.get("partner_id")

        try:
            # Check if the partner ID exists and the user has a "partner" role
            partner = User.objects.get(id=partner_id, role="partner")
        except User.DoesNotExist:
            return Response(
                {"error": "Partner not found or user is not a partner."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Assign the partner to the QR code
        qrcode.partner = partner

        # Update the status to 'assigned' if a partner is assigned
        qrcode.status = "assigned"
        qrcode.save()

        return Response(
            {"message": "Partner assigned and status updated to 'assigned'."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def update_deceased(self, request, pk=None):
        qr_code = self.get_object()
        deceased_id = request.data.get("deceased_id")

        # Check if a partner is assigned
        if not qr_code.partner:
            return Response(
                {"error": "Partner must be assigned before updating deceased."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Check if the deceased exists
            deceased = DeceasedPerson.objects.get(id=deceased_id)

            # Update QRCode fields
            qr_code.deceased = deceased  # Update the relationship to the DeceasedPerson
            qr_code.deceased_id = deceased_id  # Update the deceased_id field

            # Create the dynamic URL with deceased ID
            qr_code.url = f"http://127.0.0.1:5501/single_sample.html?id={deceased_id}"

            # Save the QR code with the updated URL
            qr_code.save()

            # Update Hovercode URL
            response = requests.put(
                f"https://hovercode.com/api/v2/hovercode/{qr_code.hovercode_id}/update/",
                headers={"Authorization": f"Token {settings.HOVERCODE_API_TOKEN}"},
                json={"qr_data": qr_code.url},  # Use the updated URL here
            )

            if response.status_code == 200:
                # Update status to 'assigned' since a partner is present
                qr_code.status = "assigned"
                qr_code.save()

                # Send email notification to partner
                self.send_update_email(qr_code)
                return Response({"status": "updated"})
            else:
                return Response(
                    {"error": "Failed to update QR code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except DeceasedPerson.DoesNotExist:
            return Response(
                {"error": "Deceased person not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def send_update_email(self, qr_code):
        subject = "QR Code Updated"
        message = (
            f"The QR code for deceased ID: {qr_code.deceased_id} has been updated.\n"
            f"Hovercode ID: {qr_code.hovercode_id}\n"
            f"Status: {qr_code.status}"
        )
        recipient_list = [qr_code.partner.email] if qr_code.partner else []
        send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)

    @action(detail=False, methods=["post"])
    def assign_multiple_partners(self, request):
        partner_id = request.data.get(
            "partner_id"
        )  # Get the partner ID from the request body
        qr_code_ids = request.data.get("qr_code_ids", [])  # Get the list of QR code IDs

        if not partner_id or not qr_code_ids:
            return Response(
                {"error": "Partner ID and QR code IDs are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            User = get_user_model()
            partner = User.objects.get(id=partner_id)  # Validate partner existence
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Update each QR code
        updated_qr_codes = []
        for qr_code_id in qr_code_ids:
            try:
                qr_code = QRCode.objects.get(id=qr_code_id)
                qr_code.partner = partner
                qr_code.status = "assigned"
                qr_code.save()
                updated_qr_codes.append(qr_code.id)  # Track updated QR code IDs
            except QRCode.DoesNotExist:
                continue  # Skip if QR code does not exist

        return Response({"status": "updated", "updated_qr_codes": updated_qr_codes})

        # Custom action to retrieve all QR codes assigned to the logged-in partner

    @action(
        detail=False,
        methods=["get"],
        url_path="assigned_qrcodes",
        permission_classes=[IsAuthenticated],
    )
    def assigned_qrcodes(self, request):
        # Get the current logged-in user
        user = request.user

        # Check if the user is a partner
        if user.role == "partner":  # Assuming you have a 'role' field in the User model
            # Retrieve all QR codes assigned to this partner
            assigned_qrcodes = QRCode.objects.filter(partner=user)
            serializer = self.get_serializer(assigned_qrcodes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "You are not authorized to view this data."},
                status=status.HTTP_403_FORBIDDEN,
            )

    def send_update_email(self, qr_code):
        subject = "QR Code Updated"
        message = (
            f"The QR code for deceased ID: {qr_code.deceased_id} has been updated.\n"
            f"Hovercode ID: {qr_code.hovercode_id}\n"
            f"Status: {qr_code.status}"
            f"Deceased person profile link: {qr_code.url}"
        )
        recipient_list = [qr_code.partner.email] if qr_code.partner else []
        send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)

    @action(
        detail=False,
        methods=["patch"],
        url_path="update_qrcode_status",
        permission_classes=[IsAuthenticated],  # Only authenticated users can update
    )
    def update_qrcode_status(self, request):
        # Get the QR code ID from the request data
        qrcode_id = request.data.get("id", None)
        new_status = request.data.get("status", None)

        if not qrcode_id or not new_status:
            return Response(
                {"error": "QR code ID and status are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the new status
        if new_status not in ["assigned", "unassigned", "delivered"]:
            return Response(
                {
                    "error": "Invalid status. Valid statuses are 'assigned', 'unassigned', 'delivered'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Retrieve the QR code by its ID
            qrcode = QRCode.objects.get(pk=qrcode_id)

            # Update the status
            qrcode.status = new_status
            qrcode.save()

            return Response(
                {"message": "QR code status updated successfully."},
                status=status.HTTP_200_OK,
            )

        except QRCode.DoesNotExist:
            return Response(
                {"error": "QR code not found."}, status=status.HTTP_404_NOT_FOUND
            )


class UpdateDeceasedQRCodeView(APIView):
    def post(self, request, pk):
        qrcode = get_object_or_404(QRCode, pk=pk)
        deceased = get_object_or_404(DeceasedPerson, pk=request.data["deceased_id"])

        # Call utility function to update and send email
        update_qrcode_with_deceased(qrcode, deceased)

        return Response({"status": "updated"})
