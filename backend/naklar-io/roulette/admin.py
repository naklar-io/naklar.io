from django.conf import settings
from django.contrib import admin

from _shared.admin import ExportCsvMixin
from account.admin import SingleAccessCodeInline
from roulette.models import Feedback, Report
from .models import Match, Meeting, StudentRequest, TutorRequest


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    model = Match
    list_display = ('id', 'created_time', 'successful', 'fail_reason')
    list_filter = ('failed', 'successful', 'fail_reason')
    raw_id_fields = ('tutor', 'student', 'tutor_request', 'student_request')

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin, ExportCsvMixin):
    model = Feedback
    list_display = ('provider', 'rating', 'created')
    date_hierarchy = 'created'
    ordering = ['-created']
    raw_id_fields = ['provider', 'receiver', 'meeting']
    actions = ['export_as_csv']


class FeedbackInline(admin.StackedInline):
    model = Feedback
    extra = 0
    max_num = 2
    raw_id_fields = ['provider', 'receiver']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin, ExportCsvMixin):
    model = Meeting
    list_display = ('meeting_id', 'ended', 'tutor',
                    'student', 'time_established', 'duration')
    actions = ['end_meeting', 'export_as_csv']
    search_fields = ('tutor__email', 'student__email')
    date_hierarchy = 'time_established'
    ordering = ['-time_established']
    raw_id_fields = ('tutor', 'student', 'users')

    inlines = [
        FeedbackInline,
    ]
    if settings.NAKLAR_USE_ACCESS_CODES:
        inlines.append(SingleAccessCodeInline)

    def end_meeting(self, request, queryset):
        for m in queryset:
            m.end_meeting()

    def access_code(self, obj):
        return obj.accesscode_set.first()


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


class RequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'created', 'duration', 'is_active',
                    'number_failed_matches', '_successful')
    raw_id_fields = ('user', 'meeting')
    autocomplete_fields = ('failed_matches', )
    list_filter = ('is_active', RequestHadMeetingFilter)

    def number_failed_matches(self, obj):
        return obj.failed_matches.count()

    def has_match(self, obj):
        return hasattr(obj, 'match')
    number_failed_matches.short_description = "#Fehlgeschl. Matches"
    has_match.boolean = True


@admin.register(StudentRequest)
class StudentRequestAdmin(RequestAdmin):
    model = StudentRequest
    list_display = ('user', 'created', 'duration', 'is_active', 'subject',
                    'number_failed_matches', '_successful')


@admin.register(TutorRequest)
class TutorRequestAdmin(RequestAdmin):
    model = TutorRequest


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    model = Report
    list_display = ('provider', 'receiver', 'created')
    raw_id_fields = ['provider', 'receiver', 'meeting']
    date_hierarchy = ('created')
    ordering = ['-created']

