# Generated by Django 4.1.1 on 2022-11-12 07:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_rename_contentvote_voteoncontent'),
    ]

    operations = [
        migrations.CreateModel(
            name='Nft',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('ipfs', models.CharField(max_length=500)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('content', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.content')),
            ],
        ),
    ]
