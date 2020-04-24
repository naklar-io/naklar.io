from django.contrib import admin
from django.contrib.admin.templatetags.admin_list import date_hierarchy

from roulette.models import Feedback

from .models import Match, Meeting, StudentRequest, TutorRequest

admin.site.register(Match)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    model = Feedback
    list_display = ('provider', 'rating', 'created')
    date_hierarchy = ('created')
    ordering = ['-created']


class FeedbackInline(admin.StackedInline):
    model = Feedback
    extra = 0
    max_num = 2


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    model = Meeting
    list_display = ('meeting_id', 'ended', 'tutor',
                    'student', 'time_established')
    actions = ['end_meeting']
    search_fields = ('tutor__email', 'student__email')
    date_hierarchy = ('time_established')
    ordering = ['-time_established']

    inlines = [
        FeedbackInline
    ]

    def end_meeting(self, request, queryset):
        for m in queryset:
            m.end_meeting()


@admin.register(StudentRequest)
class StudentRequestAdmin(admin.ModelAdmin):
    model = StudentRequest
    list_display = ('user', 'created', 'subject',
                    'number_failed_matches', 'has_match')

    def number_failed_matches(self, obj):
        return obj.failed_matches.count()

    def has_match(self, obj):
        return hasattr(obj, 'match')
    number_failed_matches.short_description = "#Fehlgeschl. Matches"
    has_match.boolean = True


@admin.register(TutorRequest)
class TutorRequestAdmin(admin.ModelAdmin):
    model = TutorRequest
    list_display = ('user', 'created', 'number_failed_matches', 'has_match')

    def number_failed_matches(self, obj):
        return obj.failed_matches.count()
    number_failed_matches.short_description = "#Fehlgeschl. Matches"

    def has_match(self, obj):
        return hasattr(obj, 'match')
    has_match.boolean = True

