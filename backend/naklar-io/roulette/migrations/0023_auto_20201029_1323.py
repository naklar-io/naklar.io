# Generated by Django 3.1.2 on 2020-10-29 12:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roulette', '0022_match_successful'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='match',
            name='unique_active_match_per_request',
        ),
        migrations.AddConstraint(
            model_name='match',
            constraint=models.UniqueConstraint(condition=models.Q(('failed', False), ('successful', False)), fields=('student_request', 'tutor_request'), name='unique_active_match_per_request'),
        ),
    ]
