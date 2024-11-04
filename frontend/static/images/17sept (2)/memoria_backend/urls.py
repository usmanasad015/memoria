from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView  # Import the custom view
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("partners.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("products.urls")),
    path("api/", include("deceased.urls")),
    path("api/", include("timeline.urls")),
    path("api/", include("organizations.urls")),
    path("api/qrcode/", include("qrcode.urls")),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
