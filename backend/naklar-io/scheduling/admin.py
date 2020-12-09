from django.contrib import admin

# Register your models here.
from scheduling.models import Appointment, TimeSlot

admin.site.register(Appointment)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    fields = ['owner', 'duration', 'start_time', 'weekly']
    readonly_fields = ['available_slots']

