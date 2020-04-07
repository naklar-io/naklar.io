from rest_framework import generics
from rest_framework import serializers
from rest_framework import permissions
from rest_framework import status

from rest_framework.response import Response

from account.serializers import SubjectSerializer, StateSerializer,\
        CustomUserSerializer, CurrentUserSerializer, SchoolDataSerializer, SchoolTypeSerializer
from account.models import Subject, State, CustomUser, SchoolType, SchoolData

from account.permissions import IsUser
from knox.views import LoginView as KnoxLoginView
from rest_framework.authentication import BasicAuthentication


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]


class StateList(generics.ListAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer


class SubjectList(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class SchoolTypeList(generics.ListAPIView):
    queryset = SchoolType.objects.all()
    serializer_class = SchoolTypeSerializer


class SchoolDataList(generics.ListAPIView):
    serializer_class = SchoolDataSerializer

    def get_queryset(self):
        if 'school_type' in self.kwargs:
            school_type = self.kwargs['school_type']
            return SchoolData.objects.filter(school_type=school_type)
        else:
            return SchoolData.objects.all()


class CustomUserView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomUserSerializer
    lookup_field = 'uuid'

class CustomUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CurrentUserSerializer


class CurrentUserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CurrentUserSerializer
    queryset = CustomUser.objects.all()

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = CurrentUserSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            raise serializers.ValidationError(serializer.errors)

    def patch(self, request):
        serializer = CurrentUserSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            raise serializers.ValidationError(serializer.errors)

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save()
        return Response(status=status.HTTP_202_ACCEPTED)

    permission_classes = [permissions.IsAuthenticated]
