# Generated by Django 3.1.3 on 2020-12-07 13:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0011_auto_20201114_1926'),
        ('scheduling', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='scheduledrequest',
            name='topic',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='scheduledrequest',
            name='subject',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='account.subject'),
        ),
    ]
