from django.urls import path
from .views import PartnerListCreateView, PartnerDetailView

urlpatterns = [
    path('partners/', PartnerListCreateView.as_view(), name='partner-list-create'),
    path('partners/<int:pk>/', PartnerDetailView.as_view(), name='partner-detail'),
]
