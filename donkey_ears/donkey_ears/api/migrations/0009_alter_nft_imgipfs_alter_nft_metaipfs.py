# Generated by Django 4.1.1 on 2022-11-14 03:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_rename_ipfs_nft_imgipfs_nft_metaipfs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nft',
            name='imgIpfs',
            field=models.CharField(default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='nft',
            name='metaIpfs',
            field=models.CharField(default='', max_length=500),
        ),
    ]
