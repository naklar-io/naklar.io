from django.contrib import admin

from roulette.models import Feedback

from .models import Match, Meeting, StudentRequest, TutorRequest

admin.site.register(Match)
admin.site.register(Meeting)
admin.site.register(StudentRequest)
admin.site.register(TutorRequest)
admin.site.register(Feedback)
