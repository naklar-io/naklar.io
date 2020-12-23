import os
import re

from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Optional

from django.db.models import Q, Count, QuerySet
from django.db.models.functions import Now

from account.models import Subject

if TYPE_CHECKING:
    from scheduling.models import TimeSlot


def check_slot_in_range(start_time: datetime, duration: timedelta, timeslot: 'TimeSlot'):
    timeslot_start = timeslot.start_time
    if timeslot.weekly:
        if timeslot_start.weekday() != start_time.weekday():
            return False
        timeslot_start = datetime.combine(start_time.date(), timeslot_start.time(), timeslot_start.tzinfo)
    return timeslot_start <= start_time <= timeslot_start + timeslot.duration - duration


def find_matching_timeslot(start_time: datetime, duration: timedelta,
                           subject: Subject, requester, qs: QuerySet['TimeSlot']
                           ) -> Optional['TimeSlot']:
    qs = qs.prefetch_related(
        "appointment_set"
    ).select_related(
        'owner'
    ).filter(
        start_time__lte=start_time,
        start_time__time__lte=start_time.timetz(),
        start_time__iso_week_day=start_time.isoweekday(),
        duration__gte=duration,
        owner__tutordata__subjects=subject,
        owner__tutordata__verified=True
    ).annotate(
        num_appointments=Count(
            'owner__timeslot__appointment',
            filter=Q(owner__timeslot__appointment__start_time__gte=Now())
        )
    ).order_by('num_appointments')
    for timeslot in qs:
        for available in timeslot.available_slots():
            if available.start_time <= start_time and (available.start_time + available.duration
                                                       >= start_time + duration):
                return available.parent
    return None


def load_email_templates(replace=False):
    basedir = os.path.join(os.path.dirname(__file__), 'templates/scheduling/')
    files = [os.path.join(basedir, f) for f in os.listdir(basedir)]
    title_regex = re.compile("<title>(.*)<\/title>")
    from post_office.models import EmailTemplate
    for f in files:
        name, ext = os.path.splitext(os.path.basename(f))
        template = EmailTemplate.objects.filter(name=name)
        if not template:
            template = EmailTemplate.objects.create(name=name)
        else:
            if replace:
                template = template.get()
            else:
                return
        with open(f, 'r') as to_read:
            content = to_read.read()
            title = title_regex.findall(content)[0]
            template.html_content = content
            template.subject = title
        template.save()
