from rest_framework import generics
from rest_framework.generics import DestroyAPIView
from .models import Product
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart
from .serializers import ProductSerializer, CartSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductsAddCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class CartListCreateView(generics.ListCreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartDetailView(generics.ListAPIView):
    serializer_class = CartSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter cart items for the logged-in user
        return Cart.objects.filter(user_id=self.kwargs["pk"])


class CartDeleteView(DestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    # permission_classes = [
    #     IsAuthenticated
    # ]  # Optional, if you want to ensure only authenticated users can delete

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
