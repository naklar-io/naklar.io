from datetime import datetime, timedelta

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_duration(value: timedelta):
    if value.seconds % (15 * 60) != 0:
        raise ValidationError(_('Duration needs to be a multiple of 15 minutes!'))


def validate_start_time(value: datetime):
    if value.minute % 15 != 0 or value.second > 0 and value.microsecond > 0:
        raise ValidationError(_('Start time needs to be at a multiple of 15 minutes!'))
