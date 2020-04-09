from rest_framework import generics, permissions, viewsets

from .models import InterestedIndividual
from .serializers import IndividualSerializer


class IndividialAdd(generics.CreateAPIView):
    queryset = InterestedIndividual.objects.all()
    serializer_class = IndividualSerializer
