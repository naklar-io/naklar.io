from django.contrib import admin

# Register your models here.
from scheduling.models import ScheduledRequest, TimeSlot

admin.site.register(ScheduledRequest)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    fields = ['owner', 'duration', 'start_time', 'weekly', 'available_slots']
    readonly_fields = ['available_slots']


