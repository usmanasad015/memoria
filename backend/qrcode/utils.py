from django.core.mail import send_mail
from django.conf import settings


def update_qrcode_with_deceased(qrcode, deceased):
    # Update QR code with deceased
    qrcode.deceased = deceased
    qrcode.save()

    # Send email notification to the partner
    send_mail(
        subject="Deceased Person Assigned to QR Code",
        message=f"Hello, a deceased person ({deceased.name}) has been assigned to the QR code.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[qrcode.partner.email],  # Assuming partner is related to QR code
        fail_silently=False,
    )
