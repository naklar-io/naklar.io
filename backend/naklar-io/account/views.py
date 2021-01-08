from django.db.models import F, Q
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from knox.views import LoginView as KnoxLoginView
from rest_framework import (exceptions, generics, permissions, status, viewsets)
from rest_framework.authentication import BasicAuthentication
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from account.models import (CustomUser, PasswordResetToken, SchoolData,
                            SchoolType, State, Subject, TutorData,
                            VerificationToken, TrackingDenyCounter, AccessCode)
from account.permissions import IsStudent
from account.serializers import (CurrentUserSerializer, CustomUserSerializer,
                                 PasswordResetRequestSerializer,
                                 SchoolDataSerializer, SchoolTypeSerializer,
                                 StateSerializer, SubjectSerializer, AccessCodeSerializer)
from scheduling.models import Appointment


class LoginView(KnoxLoginView):
    authentication_classes = [BasicAuthentication]


class StateList(generics.ListAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
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


class CurrentUserView(ModelViewSet):
    serializer_class = CurrentUserSerializer
    queryset = CustomUser.objects. \
        select_related('tutordata', 'studentdata', 'state'). \
        prefetch_related('tutordata__subjects', 'tutordata__schooldata').all()

    def get_object(self):
        return self.request.user

    permission_classes = [permissions.IsAuthenticated]


verification_file_parameter = openapi.Parameter(
    "verification_file", openapi.IN_FORM, required=True, type=openapi.TYPE_FILE)


class UploadVerificationView(APIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser,)

    @swagger_auto_schema(manual_parameters=[verification_file_parameter])
    def post(self, request, format=None):
        tutordata = TutorData.objects.filter(user=request.user)
        if tutordata:
            tutordata = tutordata.get()
        else:
            raise exceptions.NotFound("Keine Tutordata gefunden!")
        file = request.FILES['verification_file']
        if tutordata.verification_file:
            tutordata.verification_file.delete()
        tutordata.verification_file.save(file.name, file)
        tutordata.save()
        serializer = self.serializer_class(instance=request.user)
        return Response(serializer.data)


class DeleteVerificationView(generics.GenericAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        tutordata = TutorData.objects.filter(user=request.user)
        if tutordata:
            tutordata = tutordata.get()
            tutordata.verification_file.delete()
            tutordata.save()
        return Response(self.serializer_class(instance=request.user).data)


class AccessCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AccessCode.objects.filter(Q(appointment__isnull=True) |
                                         Q(appointment__status__in=[Appointment.Status.OWNER_REJECTED,
                                                                    Appointment.Status.INVITEE_REJECTED]),
                                         meeting__isnull=True, used=False)
    serializer_class = AccessCodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    lookup_field = 'code'

    @action(detail=True, methods=['POST'], queryset=queryset.filter(user__isnull=True))
    def redeem(self, request, code=None):
        access_code: AccessCode = self.get_object()
        access_code.user = request.user
        access_code.redeem_time = timezone.now()
        access_code.save()
        return Response(data=self.get_serializer(instance=access_code).data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset().filter(user=request.user, used=False))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@api_view(['POST'])
def verify_email(request, token):
    if not token:
        raise exceptions.NotAcceptable(detail="Kein Token gefunden!")
    verify_token = get_object_or_404(VerificationToken, token=token)
    if verify_token.user.check_email_verification(token):
        return Response({"success": True})
    else:
        return Response({"error": "Token nicht gültig!"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resend_verification(request):
    request.user.send_verification_email()
    return Response({"success": True})


@swagger_auto_schema(method='POST', request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
    'email': openapi.Schema(type=openapi.TYPE_STRING)}))
@api_view(['POST'])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response({"success": True})


@swagger_auto_schema(method='POST', request_body=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
    'password': openapi.Schema(type=openapi.TYPE_STRING)}))
@api_view(['POST'])
def password_reset_verify(request, token):
    token = get_object_or_404(PasswordResetToken, token=token)
    password = request.data.get('password', None)
    if not password:
        raise exceptions.ValidationError({"password": "Passwort muss angegeben werden!"})
    else:
        user = token.user
        user.set_password(password)
        user.save()
        # delete token after usage
        token.delete()
        return Response({"success": True})


@api_view(['POST'])
def send_tracking_deny(request):
    counter = TrackingDenyCounter.load()
    counter.count = F('count') + 1
    counter.save()
    return Response({})
