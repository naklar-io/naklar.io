from django.contrib import admin

# Register your models here.
from simple_history.admin import SimpleHistoryAdmin

from scheduling.models import Appointment, TimeSlot


@admin.register(Appointment)
class AppointmentAdmin(SimpleHistoryAdmin):
    history_list_display = ['status']
    date_hierarchy = 'start_time'
    ordering = ['start_time']
    raw_id_fields = ['owner', 'timeslot', 'meeting', 'invitee_rejects']
    list_display = ['start_time', 'owner', 'invitee', 'duration', 'status', 'subject']


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    fields = ['owner', 'duration', 'start_time', 'weekly']
    readonly_fields = ['available_slots']
