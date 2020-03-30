from .models import InterestedIndividual
from rest_framework import serializers


class IndividualSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterestedIndividual
        fields = ['email', 'ind_type', 'updates']
