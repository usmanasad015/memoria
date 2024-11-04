from rest_framework import serializers
from .models import Product, Cart


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):
    # product = ProductSerializer()  # Use ProductSerializer for the product field

    class Meta:
        model = Cart
        fields = "__all__"
