from django.contrib import admin
from django.contrib.admin.templatetags.admin_list import date_hierarchy
from django.db.models import QuerySet

from roulette.models import Feedback, Report

from .models import Match, Meeting, StudentRequest, TutorRequest

admin.site.register(Match)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    model = Feedback
    list_display = ('provider', 'rating', 'created')
    date_hierarchy = ('created')
    ordering = ['-created']
    raw_id_fields = ['provider', 'receiver', 'meeting']


class FeedbackInline(admin.StackedInline):
    model = Feedback
    extra = 0
    max_num = 2
    raw_id_fields = ['provider', 'receiver']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    model = Meeting
    list_display = ('meeting_id', 'ended', 'tutor',
                    'student', 'time_established', 'duration')
    actions = ['end_meeting']
    search_fields = ('tutor__email', 'student__email')
    date_hierarchy = ('time_established')
    ordering = ['-time_established']
    raw_id_fields = ('tutor', 'student', 'users')

    inlines = [
        FeedbackInline
    ]

    def end_meeting(self, request, queryset):
        for m in queryset:
            m.end_meeting()


class RequestHadMeetingFilter(admin.SimpleListFilter):
    title = "Hatte Meeting"
    parameter_name = "had_meeting"

    def lookups(self, request, model_admin):
        return ((True, 'Hatte Meeting'),
                (False, 'Hatte kein Meeting'))

    def queryset(self, request, queryset):
        if self.value() is not None:
            return queryset.exclude(meeting__isnull=self.value())
        else:
            return queryset


@admin.register(StudentRequest)
class StudentRequestAdmin(admin.ModelAdmin):
    model = StudentRequest
    list_display = ('user', 'created', 'duration', 'is_active', 'subject',
                    'number_failed_matches', '_successful')
    raw_id_fields = ('user', 'meeting')
    list_filter = ('is_active', RequestHadMeetingFilter)

    def number_failed_matches(self, obj):
        return obj.failed_matches.count()

    def has_match(self, obj):
        return hasattr(obj, 'match')
    number_failed_matches.short_description = "#Fehlgeschl. Matches"
    has_match.boolean = True


@admin.register(TutorRequest)
class TutorRequestAdmin(admin.ModelAdmin):
    model = TutorRequest
    list_display = ('user', 'created', 'duration', 'is_active',
                    'number_failed_matches', 'successful')
    raw_id_fields = ('user', 'meeting')
    list_filter = ('is_active', )

    def number_failed_matches(self, obj):
        return obj.failed_matches.count()
    number_failed_matches.short_description = "#Fehlgeschl. Matches"

    def has_match(self, obj):
        return hasattr(obj, 'match')
    has_match.boolean = True


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    model = Report
    list_display = ('provider', 'receiver', 'created')
    raw_id_fields = ['provider', 'receiver', 'meeting']
    date_hierarchy = ('created')
    ordering = ['-created']
