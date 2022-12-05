# Generated by Django 4.1.1 on 2022-11-24 22:14

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_content_image1'),
    ]

    operations = [
        migrations.AddField(
            model_name='vote',
            name='created',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='vote',
            name='toWhom',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='voteoncontent',
            name='created',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='voteoncontent',
            name='toWhom',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]