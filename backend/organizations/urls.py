from django.urls import path
from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    PartnerListCreateView,
    PartnerDeleteView,
    RegisterPartnerView,
    PartnerListView,
)

urlpatterns = [
    path(
        "organizations/",
        OrganizationListCreateView.as_view(),
        name="organization-list-create",
    ),
    path(
        "organizations/<int:pk>/",
        OrganizationDetailView.as_view(),
        name="organization-detail",
    ),
    path(
        "organizations/<int:organization_id>/partners/",
        PartnerListCreateView.as_view(),
        name="partner-list-create",
    ),
    path(
        "organizations/partners/",
        PartnerListCreateView.as_view(),
        name="partner-list-create",
    ),
    path(
        "organizations/partners/<int:pk>/delete",
        PartnerDeleteView.as_view(),
        name="partner-delete",
    ),
    path("partner/register/", RegisterPartnerView.as_view(), name="partner-register"),
    path("partners-org/", PartnerListView.as_view(), name="partners-list"),
]
