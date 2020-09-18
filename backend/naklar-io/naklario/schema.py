import graphene
import account.schema

from graphene_django.debug import DjangoDebug

class Query(
    account.schema.Query,
    graphene.ObjectType,
):
    debug = graphene.Field(DjangoDebug, name="_debug")


schema = graphene.Schema(query=Query)