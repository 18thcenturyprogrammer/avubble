# Generated by Django 4.1.1 on 2022-11-24 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_alter_nft_imgipfs_alter_nft_metaipfs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='content',
            name='image1',
            field=models.ImageField(blank=True, default='avubble_logo.png', null=True, upload_to=''),
        ),
    ]