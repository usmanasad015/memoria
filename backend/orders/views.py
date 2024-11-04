from rest_framework import generics
from .models import Order
from .serializers import OrderSerializer
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import OrderItemSerializer

import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views import View
import json


from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from .serializers import OrderSerializer
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from products.models import Cart  # Import Cart model to access product vendor emails


class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def update(self, request, *args, **kwargs):
        # Update the order and its items, including status
        return super().update(request, *args, **kwargs)


stripe.api_key = settings.STRIPE_SECRET_KEY


class OrderItemStatusUpdateView(APIView):
    def get(self, request, pk):
        order_item = get_object_or_404(OrderItem, pk=pk)
        order_item.status = "delivered"  # Update the status to 'delivered'
        order_item.save()
        return Response(
            {"message": "Order item status updated to delivered."},
            status=status.HTTP_200_OK,
        )


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


@method_decorator(csrf_exempt, name="dispatch")
class SendOrderEmailsView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {"error": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch the order and its items
        order = get_object_or_404(Order, id=order_id)
        cart_items = Cart.objects.filter(
            user=order.user
        )  # Assuming user in order has a related cart

        for cart_item in cart_items:
            product = cart_item.product
            vendor_email = product.vendor_email

            # Prepare email content
            user_details = f"User: {order.user.username} (Email: {order.user.email})"
            product_details = (
                f"Product: {product.name}\n"
                f"Quantity: {cart_item.quantity}\n"
                f"Price: ${product.price}\n"
                f"Total Price: ${product.price * cart_item.quantity}\n"
            )
            status_update_link = request.build_absolute_uri(
                reverse("order-item-status-update", args=[cart_item.id])
            )

            email_content = (
                f"Dear Vendor,\n\n"
                f"You have a new order:\n"
                f"{user_details}\n"
                f"{product_details}\n"
                f"Click the following link to mark this order as delivered:\n"
                f"{status_update_link}\n\n"
                f"Thank you!"
            )

            # Send email to vendor
            send_mail(
                subject=f"New Order for {product.name}",
                message=email_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor_email],
                fail_silently=False,
            )

        return Response(
            {"message": "Emails sent successfully."}, status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name="dispatch")
class ChangeOrderStatusView(APIView):
    def get(self, request, order_id, *args, **kwargs):
        # Fetch the order and update status to 'pending'
        order = get_object_or_404(Order, id=order_id)
        order.status = "pending"
        order.save()

        return Response(
            {"message": "Order status updated to 'pending'."}, status=status.HTTP_200_OK
        )
