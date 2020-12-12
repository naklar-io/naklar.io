from django.contrib import admin


class SingletonModelAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        return super(SingletonModelAdmin, self).change_view(request, str(self.model.load().pk))
