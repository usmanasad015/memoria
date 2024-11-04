from rest_framework import generics
from .models import Order
from .serializers import OrderSerializer
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views import View
import json


class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


stripe.api_key = settings.STRIPE_SECRET_KEY


@method_decorator(csrf_exempt, name="dispatch")
class CreateCheckoutSessionView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            products = data.get("products", [])

            # Prepare line items based on the provided products
            line_items = [
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": product["name"],
                        },
                        "unit_amount": product["amount"],  # Amount in cents
                    },
                    "quantity": product["quantity"],
                }
                for product in products
            ]

            # Create checkout session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url="http://localhost:8000/api/success",  # URL to redirect after successful payment
                cancel_url="http://localhost:8000/api/cancel",  # URL to redirect if payment is canceled
            )
            return JsonResponse({"url": checkout_session.url})  # Return the URL here
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def payment_success(request):
    return render(request, "payment_success.html")


def payment_cancel(request):
    return render(request, "payment_cancel.html")
