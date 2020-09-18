import graphene
from graphene import ObjectType, Node

from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType

from account.models import SchoolData, SchoolType


class SchoolTypeType(DjangoObjectType):
    class Meta:
        model = SchoolType
        fields = ("id", "name", "schooldata_set")

class SchoolDataType(DjangoObjectType):
    class Meta:
        model = SchoolData
        fields = ['grade', 'school_type', 'id']

class Query(ObjectType):
    schooltype = graphene.Field(SchoolTypeType, id=graphene.String())
    schooltypes = graphene.List(SchoolTypeType)
    schooldata = graphene.Field(SchoolDataType, id=graphene.String())
    schooldatas = graphene.List(SchoolDataType)

    def resolve_schooltypes(root, info, **kwargs):
        return SchoolType.objects.all()

    def resolve_schooldata_by_id(root, info, id):
        return SchoolData.objects.get(pk=id)

    def resolve_schooldatas(root, info, **kwargs):
        return SchoolData.objects.all()
    