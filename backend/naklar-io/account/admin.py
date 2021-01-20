import csv

from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponse
from django.utils.translation import gettext as _

from _shared.admin import ExportCsvMixin as GeneralExportCsvMixin
from _shared.admin import SingletonModelAdmin
from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import (CustomUser, SchoolData, SchoolType, State, StudentData,
                     Subject, TutorData, TrackingDenyCounter, AccessCode)

admin.site.register(SchoolData)
admin.site.register(SchoolType)
admin.site.register(State)
admin.site.register(Subject)


class NullFilterSpec(admin.SimpleListFilter):
    title = ''

    parameter_name = ''

    def lookups(self, request, model_admin):
        return (
            ('1', _('Yes'),),
            ('0', _('No'),),
        )

    def queryset(self, request, queryset):
        kwargs = {
            '%s' % self.parameter_name: None,
        }
        print(self.value())
        if self.value():
            if self.value() == '0':
                return queryset.filter(**kwargs)
            if self.value() == '1':
                return queryset.exclude(**kwargs)
        else:
            return queryset


class AppointmentNullFilter(NullFilterSpec):
    title = _('appointment')
    parameter_name = 'appointment'


class MeetingNullFilter(NullFilterSpec):
    title = _('meeting')
    parameter_name = 'meeting'


class UserNullFilter(NullFilterSpec):
    title = _('user')
    parameter_name = 'user'


if settings.NAKLAR_USE_ACCESS_CODES:
    @admin.register(AccessCode)
    class AccessCodeAdmin(admin.ModelAdmin, GeneralExportCsvMixin):
        list_display = ['code', 'user', 'used', 'redeem_time']
        actions = ['export_as_csv', ]
        autocomplete_fields = ['user', 'appointment', 'meeting']
        list_filter = ['used', AppointmentNullFilter, MeetingNullFilter, UserNullFilter]
        search_fields = ['code']


class AccessCodeInline(admin.StackedInline):
    model = AccessCode


class SingleAccessCodeInline(AccessCodeInline):
    max_num = 1
    extra = 0
    can_delete = False
    show_change_link = True

    # make immutable in view

    def has_add_permission(self, request, obj):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class ExportCsvMixin:
    def export_csv(self, request, queryset):

        meta = self.model._meta
        field_names = [field.name for field in meta.fields if field.name != "password"]
        field_names.append("type")

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([self.get_data(obj, field) for field in field_names])

        return response

    export_csv.short_description = "CSV exportieren"

    def get_data(self, obj, field):
        if field == "type":
            if hasattr(obj, "tutordata"):
                return "tutor"
            elif hasattr(obj, "studentdata"):
                return "student"
            else:
                return "nothing"
        else:
            return getattr(obj, field)


class StudentDataInline(admin.StackedInline):
    model = StudentData
    verbose_name = "Schülerdaten"
    verbose_name_plural = verbose_name

    max_num = 1
    extra = 0


class TutorDataInline(admin.StackedInline):
    model = TutorData
    verbose_name = "Tutordaten"
    verbose_name_plural = verbose_name
    fields = ['schooldata', 'subjects', 'verified',
              'verification_file', 'profile_picture', 'image_tag']
    readonly_fields = ['image_tag']

    max_num = 1
    extra = 0


class TutorDataFilter(admin.SimpleListFilter):
    title = _('Tutor')

    parameter_name = 'is_tutor'

    def lookups(self, request, model_admin):
        return (('not_null', _('Yes')),
                ('null', _('No')))

    def queryset(self, request, queryset):
        if self.value() == 'null':
            return queryset.filter(tutordata__isnull=True)
        elif self.value() == 'not_null':
            return queryset.filter(tutordata__isnull=False)


class StudentDataFilter(admin.SimpleListFilter):
    title = _('Schüler')

    parameter_name = 'is_student'

    def lookups(self, request, model_admin):
        return (('not_null', _('Yes')),
                ('null', _('No')))

    def queryset(self, request, queryset):
        if self.value() == 'null':
            return queryset.filter(studentdata__isnull=True)
        elif self.value() == 'not_null':
            return queryset.filter(studentdata__isnull=False)


class UnverifiedTutorFilter(admin.SimpleListFilter):
    title = _('Ist verifizierter Tutor')

    parameter_name = 'verified_tutor'

    def lookups(self, request, model_admin):
        return (('yes', _('Unverified')),
                ('no', _('Verified')))

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(tutordata__isnull=False).filter(tutordata__verified=False)
        elif self.value() == 'no':
            return queryset.filter(tutordata__isnull=False).filter(tutordata__verified=True)


class CustomUserAdmin(UserAdmin, ExportCsvMixin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    change_form_template = "account/customuser_changeform.html"

    inlines = [
        StudentDataInline,
        TutorDataInline
    ]
    list_display = ('email', 'first_name', 'last_name',
                    'state', 'is_staff', 'is_active', 'is_tutor', 'is_student', 'email_verified', 'date_joined')
    list_filter = (
        'is_staff', 'is_active', 'email_verified', UnverifiedTutorFilter, StudentDataFilter, TutorDataFilter, 'state'
    )
    fieldsets = (
        (None, {'fields':
                    ('email', 'email_verified', 'first_name', 'last_name', 'gender', 'state', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups')}),
    )
    add_fieldsets = (
        (None, {
            'classes': (
                'wide',), 'fields': (
                'email', 'first_name', 'gender', 'state', 'password1', 'password2',
                'is_staff', 'is_active')}),)
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ['-date_joined']
    actions = ("export_csv",)


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(TrackingDenyCounter, SingletonModelAdmin)
