from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    CreateCheckoutSessionView,
    payment_success,
    payment_cancel,
    SendOrderEmailsView,
    ChangeOrderStatusView,
    OrderItemStatusUpdateView,
)


urlpatterns = [
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path(
        "create-checkout-session/",
        CreateCheckoutSessionView.as_view(),
        name="create-checkout-session",
    ),
    path("success/", payment_success, name="payment-success"),
    path("cancel/", payment_cancel, name="payment-cancel"),
    path(
        "orders/send-emails/", SendOrderEmailsView.as_view(), name="send_order_emails"
    ),
    path(
        "orders/<int:order_id>/change-status/",
        ChangeOrderStatusView.as_view(),
        name="change_order_status",
    ),
    path(
        "order-items/<int:pk>/status/",
        OrderItemStatusUpdateView.as_view(),
        name="order-item-status-update",
    ),  # New URL
    path("send-order-emails/", SendOrderEmailsView.as_view(), name="send-order-emails"),
    path(
        "order-item-status-update/<int:pk>/",
        OrderItemStatusUpdateView.as_view(),
        name="order-item-status-update",
    ),
]
