from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import StudentData, TutorData, State, Subject, \
        SchoolData, SchoolType, CustomUser
from .forms import CustomUserChangeForm, CustomUserCreationForm


admin.site.register(SchoolData)
admin.site.register(SchoolType)
admin.site.register(State)
admin.site.register(Subject)


class StudentDataInline(admin.StackedInline):
    model = StudentData
    verbose_name = "Schülerdaten"
    verbose_name_plural = verbose_name


class TutorDataInline(admin.TabularInline):
    model = TutorData
    verbose_name = "Tutordaten"
    verbose_name_plural = verbose_name


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    inlines = [
        StudentDataInline,
        TutorDataInline
    ]
    list_display = ('email', 'first_name', 'last_name',
                    'state', 'is_staff', 'is_active')
    list_filter = ('email', 'state', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields':
                ('email', 'first_name', 'last_name', 'state', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': (
                'wide',), 'fields': (
                'email', 'first_name', 'state', 'password1', 'password2',
                    'is_staff', 'is_active')}), )
    search_fields = ('email',)
    ordering = ('email',)


admin.site.register(CustomUser, CustomUserAdmin)
