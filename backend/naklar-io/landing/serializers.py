from rest_framework import serializers

from .models import InterestedIndividual


class IndividualSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterestedIndividual
        fields = ['email', 'ind_type', 'updates']
