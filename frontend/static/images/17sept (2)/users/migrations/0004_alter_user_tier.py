# Generated by Django 5.1.1 on 2024-09-16 11:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_user_otp_user_otp_created_at_alter_user_address_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='tier',
            field=models.CharField(blank=True, choices=[('free', 'Free'), ('premium', 'Premium'), ('enterprise', 'Enterprise')], default='free', max_length=50, null=True),
        ),
    ]