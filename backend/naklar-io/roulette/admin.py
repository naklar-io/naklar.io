from django.contrib import admin
from .models import Match, Meeting, StudentRequest, TutorRequest
# Register your models h
admin.site.register(Match)
admin.site.register(Meeting)
admin.site.register(StudentRequest)
admin.site.register(TutorRequest)