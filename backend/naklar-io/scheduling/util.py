from datetime import datetime, timedelta

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models import TimeSlot


def check_slot_in_range(start_time: datetime, duration: timedelta, timeslot: 'TimeSlot'):
    timeslot_start = timeslot.start_time
    if timeslot.weekly:
        if timeslot_start.weekday() != start_time.weekday():
            return False
        timeslot_start = datetime.combine(start_time.date(), timeslot_start.time(), timeslot_start.tzinfo)
    return timeslot_start <= start_time <= timeslot_start + timeslot.duration - duration
