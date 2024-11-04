from django.contrib import admin
from .models import QRCode

@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'hovercode_id', 'partner', 'deceased_id', 'url', 'status')
    list_filter = ('status', 'partner')
    search_fields = ('hovercode_id', 'partner__company_name', 'deceased_id')
    actions = ['bulk_download_action']

    def bulk_download_action(self, request, queryset):
        # Implement bulk download logic here
        pass

    bulk_download_action.short_description = "Bulk download selected QR codes"