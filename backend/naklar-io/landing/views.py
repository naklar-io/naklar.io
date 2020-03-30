from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import generics

from .models import InterestedIndividual
from .serializers import IndividualSerializer



class IndividialAdd(generics.CreateAPIView):
    queryset = InterestedIndividual.objects.all()
    serializer_class = IndividualSerializer

