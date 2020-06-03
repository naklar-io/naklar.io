# Generated by Django 3.0.6 on 2020-06-03 12:28

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notify', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notificationsettings',
            name='notify_interval',
            field=models.DurationField(default=datetime.timedelta(seconds=300), verbose_name='Minimaler Abstand zwischen Benachrichtigungen'),
        ),
        migrations.AlterField(
            model_name='notificationsettings',
            name='ranges_mode',
            field=models.CharField(choices=[('ALLOW', 'Während dieser Zeiten erlauben'), ('BLOCK', 'Während dieser Zeiten verbieten')], default='ALLOW', max_length=10),
        ),
        migrations.AlterField(
            model_name='notificationtimerange',
            name='end_time',
            field=models.TimeField(verbose_name='Endzeit am Tag'),
        ),
        migrations.AlterField(
            model_name='notificationtimerange',
            name='start_time',
            field=models.TimeField(verbose_name='Startzeit am Tag'),
        ),
    ]
