# Generated by Django 5.1.1 on 2024-09-08 10:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('deceased', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Timeline',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_name', models.CharField(max_length=255)),
                ('details', models.TextField()),
                ('image1', models.ImageField(blank=True, null=True, upload_to='timeline/')),
                ('image2', models.ImageField(blank=True, null=True, upload_to='timeline/')),
                ('image3', models.ImageField(blank=True, null=True, upload_to='timeline/')),
            ],
        ),
        migrations.CreateModel(
            name='DeceasedTimeline',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deceased', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='deceased.deceasedperson')),
                ('timeline', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='timeline.timeline')),
            ],
        ),
    ]