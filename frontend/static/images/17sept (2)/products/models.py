from django.db import models
from django.conf import settings


class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.FloatField()
    description = models.TextField()
    image1 = models.ImageField(upload_to="products/", null=True, blank=True)
    image2 = models.ImageField(upload_to="products/", null=True, blank=True)
    image3 = models.ImageField(upload_to="products/", null=True, blank=True)
    vendor_email = models.EmailField()

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
