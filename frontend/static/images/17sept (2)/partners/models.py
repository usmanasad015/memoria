from django.db import models

class Partner(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()
    organization_name = models.CharField(max_length=255)
    shipping_address = models.TextField()

    def __str__(self):
        return self.name
