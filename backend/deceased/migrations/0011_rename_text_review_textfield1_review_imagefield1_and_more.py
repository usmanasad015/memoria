# Generated by Django 5.1.1 on 2024-09-23 07:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deceased', '0010_alter_review_text'),
    ]

    operations = [
        migrations.RenameField(
            model_name='review',
            old_name='text',
            new_name='textfield1',
        ),
        migrations.AddField(
            model_name='review',
            name='imagefield1',
            field=models.ImageField(blank=True, null=True, upload_to='reviews/images/'),
        ),
        migrations.AddField(
            model_name='review',
            name='imagefield2',
            field=models.ImageField(blank=True, null=True, upload_to='reviews/images/'),
        ),
        migrations.AddField(
            model_name='review',
            name='imagefield3',
            field=models.ImageField(blank=True, null=True, upload_to='reviews/images/'),
        ),
        migrations.AddField(
            model_name='review',
            name='textfield2',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='review',
            name='textfield3',
            field=models.TextField(blank=True, null=True),
        ),
    ]
