from django.conf import settings
from django.contrib import admin
# Register your models here.
from django.db.models.functions import Now
from django.utils import timezone
from django.utils.translation import gettext as _
from simple_history.admin import SimpleHistoryAdmin

from _shared.admin import ExportCsvMixin
from account.admin import SingleAccessCodeInline
from scheduling.models import Appointment, TimeSlot


class AppointmentInFutureFilter(admin.SimpleListFilter):
    title = _('Is in future')
    parameter_name = 'is_in_future'
    YES_VALUE = 'yes'
    NO_VALUE = 'no'

    def lookups(self, request, model_admin):
        return (
            (self.YES_VALUE, _('Yes')),
            (self.NO_VALUE, _('No'))
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == self.YES_VALUE:
            return queryset.filter(start_time__gte=Now())
        elif value == self.NO_VALUE:
            return queryset.filter(start_time__lt=Now())
        else:
            return queryset


@admin.register(Appointment)
class AppointmentAdmin(SimpleHistoryAdmin, ExportCsvMixin):
    history_list_display = ['status']
    date_hierarchy = 'start_time'
    ordering = ['start_time']
    raw_id_fields = ['owner', 'timeslot', 'meeting', 'invitee_rejects']
    list_display = ['start_time', 'owner', 'invitee', 'duration', 'status', 'subject']
    search_fields = ['owner__email', 'timeslot__owner__email']
    list_filter = ['start_time', AppointmentInFutureFilter]
    actions = ["export_as_csv"]

    if settings.NAKLAR_USE_ACCESS_CODES:
        inlines = [SingleAccessCodeInline, ]

    def is_in_future(self, obj):
        return obj.start_time >= timezone.now()


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    fields = ['owner', 'duration', 'start_time', 'weekly']
    raw_id_fields = ['owner']
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
