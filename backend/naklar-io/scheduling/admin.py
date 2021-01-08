from django.contrib import admin

# Register your models here.
from simple_history.admin import SimpleHistoryAdmin

from _shared.admin import ExportCsvMixin
from scheduling.models import Appointment, TimeSlot


@admin.register(Appointment)
class AppointmentAdmin(SimpleHistoryAdmin, ExportCsvMixin):
    history_list_display = ['status']
    date_hierarchy = 'start_time'
    ordering = ['start_time']
    raw_id_fields = ['owner', 'timeslot', 'meeting', 'invitee_rejects']
    list_display = ['start_time', 'owner', 'invitee', 'duration', 'status', 'subject']
    actions = ["export_as_csv"]


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    fields = ['owner', 'duration', 'start_time', 'weekly']
    readonly_fields = ['available_slots']
    list_filter = ['weekly', 'deleted']
    list_display = ['owner', 'start_time', 'duration', 'weekly', 'deleted']

    def get_queryset(self, request):
        qs = self.model.all_objects.get_queryset()
        ordering = self.get_ordering(request)
        if ordering:
            qs = qs.order_by(*ordering)
        return qs

    def delete_model(self, request, obj):
        obj.hard_delete()
