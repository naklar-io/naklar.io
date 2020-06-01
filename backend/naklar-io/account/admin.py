import csv

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponse
from django.utils.translation import gettext as _

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import (CustomUser, SchoolData, SchoolType, State, StudentData,
                     Subject, TutorData)

admin.site.register(SchoolData)
admin.site.register(SchoolType)
admin.site.register(State)
admin.site.register(Subject)

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


class TutorDataInline(admin.StackedInline):
    model = TutorData
    verbose_name = "Tutordaten"
    verbose_name_plural = verbose_name
    fields = ['schooldata', 'subjects', 'verified',
              'verification_file', 'profile_picture', 'image_tag']
    readonly_fields = ['image_tag']


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

    inlines = [
        StudentDataInline,
        TutorDataInline
    ]
    list_display = ('email', 'first_name', 'last_name',
                    'state', 'is_staff', 'is_active', 'is_tutor', 'is_student', 'email_verified', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'email_verified', UnverifiedTutorFilter, StudentDataFilter, TutorDataFilter, 'state'
                   )
    fieldsets = (
        (None, {'fields':
                ('email', 'email_verified', 'first_name', 'last_name', 'gender', 'state', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': (
                'wide',), 'fields': (
                'email', 'first_name', 'state', 'password1', 'password2',
                    'is_staff', 'is_active')}), )
    search_fields = ('email',)
    ordering = ['-date_joined']
    actions = ("export_csv", )


admin.site.register(CustomUser, CustomUserAdmin)
