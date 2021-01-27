from dataclasses import dataclass

from django.conf import settings
from rest_framework import fields
from rest_framework.generics import RetrieveAPIView
from rest_framework.serializers import Serializer


@dataclass
class Features:
    codes: bool
    roulette: bool
    analytics: bool
    notifications: bool


@dataclass
class FrontendSettings:
    features: Features
    vapid_key: str


def build_settings() -> FrontendSettings:
    features = Features(codes=settings.NAKLAR_USE_ACCESS_CODES,
                        roulette=True,
                        analytics=True,
                        notifications=False)
    return FrontendSettings(features, "UNUSED")


class FeaturesSerializer(Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    codes = fields.BooleanField()
    analytics = fields.BooleanField()
    roulette = fields.BooleanField()
    notifications = fields.BooleanField()


class FrontendSettingsSerializer(Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    features = FeaturesSerializer()
    vapid_key = fields.CharField()


class FrontendSettingsView(RetrieveAPIView):
    serializer_class = FrontendSettingsSerializer

    def get_object(self):
        return build_settings()
