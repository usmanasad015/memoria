from django.db import models
from users.models import User
from partners.models import Partner
from products.models import Product
from deceased.models import DeceasedPerson


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    partner = models.ForeignKey(
        Partner, on_delete=models.CASCADE, null=True, blank=True
    )
    deceased = models.ForeignKey(
        DeceasedPerson, on_delete=models.CASCADE, null=True, blank=True
    )  # Add this line
    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50)
    total_amount = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.FloatField()

    def __str__(self):
        return f"{self.product.name} in Order {self.order.id}"
