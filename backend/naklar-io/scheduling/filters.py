from django_filters import rest_framework as filters

from scheduling import models
from account import models as account_models


class AvailableSlotFilter(filters.FilterSet):
    subject = filters.ModelChoiceFilter(
        queryset=account_models.Subject.objects.all(),
        field_name='owner__tutordata__subjects',
        label='subject'
    )

    class Meta:
        model = models.TimeSlot
        fields = ['subject']