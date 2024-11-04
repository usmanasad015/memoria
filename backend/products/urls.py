from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    CartListCreateView,
    CartDetailView,
    ProductsAddCreateView,
    CartDeleteView,
)


urlpatterns = [
    path("products/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("products/add/", ProductsAddCreateView.as_view(), name="product-add"),
    path("cart/", CartListCreateView.as_view(), name="cart-list-create"),
    path("cart/<int:pk>/", CartDetailView.as_view(), name="cart-detail"),
    path("cart/<int:pk>/delete/", CartDeleteView.as_view(), name="cart-delete"),
]
