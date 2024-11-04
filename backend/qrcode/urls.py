from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QRCodeViewSet

router = DefaultRouter()
router.register(r"qrcodes", QRCodeViewSet, basename="qrcode")

urlpatterns = router.urls


# List All QR Codes:

# Method: GET
# URL: /api/qrcode/qrcodes/
# Create Bulk QR Codes:

# Method: POST
# URL: /api/qrcode/qrcodes/create_bulk/    // this create and downloads qr codes
# Bulk Download QR Codes :   in body {"number_of_qr_codes": 50}


# Method: POST
# URL: /api/qrcode/qrcodes/{qr_code_id}/assign_partner/
# Update Deceased for a QR Code: in body {"partner_id": 123}

# Method: POST
# URL: /api/qrcode/qrcodes/{qr_code_id}/update_deceased/ in body {"deceased_id": 456}


# ------------------------------------------------
# from django.urls import path
# from .views import CreateBulkQRCodesView, FilterUnassignedQRCodesView, BulkDownloadQRCodesView, AssignPartnerToQRCodeView, UpdateDeceasedForQRCodeView

# urlpatterns = [
#     # Create Bulk QR Codes
#     path('qrcodes/create_bulk/', CreateBulkQRCodesView.as_view(), name='create_bulk_qrcodes'),

#     # Filter Unassigned QR Codes
#     path('qrcodes/filter_unassigned/', FilterUnassignedQRCodesView.as_view(), name='filter_unassigned_qrcodes'),

#     # Bulk Download QR Codes (CSV)
#     path('qrcodes/bulk_download/', BulkDownloadQRCodesView.as_view(), name='bulk_download_qrcodes'),

#     # Assign Partner to QR Code by ID
#     path('qrcodes/<int:id>/assign_partner/', AssignPartnerToQRCodeView.as_view(), name='assign_partner_qrcode'),

#     # Update Deceased for QR Code by ID
#     path('qrcodes/<int:id>/update_deceased/', UpdateDeceasedForQRCodeView.as_view(), name='update_deceased_qrcode'),
# ]
