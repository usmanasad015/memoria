from rest_framework import serializers
from .models import QRCode


class QRCodeSerializer(serializers.ModelSerializer):
    # Change PartnerSerializer to a simple field if needed
    # partner = serializers.StringRelatedField()  # Or customize this based on your needs

    class Meta:
        model = QRCode
        fields = ["id", "hovercode_id", "partner", "deceased_id", "url", "status"]
