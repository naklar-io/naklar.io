from django.core import validators
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.conf import settings

import uuid

from .managers import CustomUserManager


class SchoolType(models.Model):
    name = models.CharField(_("Name des Schultyps"), max_length=50)

    def __str__(self):
        return self.name


class SchoolData(models.Model):
    school_type = models.ForeignKey(SchoolType, on_delete=models.CASCADE)
    grade = models.IntegerField(_("Klasse"))

    def __str__(self):
        return str(self.school_type) + " - " + str(self.grade) + ". Klasse"


class State(models.Model):
    name = models.CharField(_("Name"), max_length=50, unique=True)
    shortcode = models.CharField(_("Kurzbezeichnung"), max_length=2)

    def __str__(self):
        return self.name + " (%s)" % self.shortcode


class Subject(models.Model):
    name = models.CharField(_("Name"), max_length=50)

    def __str__(self):
        return self.name


class StudentData(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)

    school_data = models.ForeignKey(SchoolData, verbose_name=_(
        "Klasse und Schulart"), on_delete=models.PROTECT)

    def __str__(self):
        return str(self.school_data) + ' - ' + str(self.user)


def tutor_upload_path(instance, filename):
    return 'tutor-files/{0}/{1}'.format(instance.user.uuid, filename)


class TutorData(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)

    schooldata = models.ManyToManyField(
        SchoolData, verbose_name=_("Mögliche Schultypen/Klassenstufen"))
    subjects = models.ManyToManyField(Subject, verbose_name=_("Fächer"))

    verified = models.BooleanField(_("Verifiziert"), default=False)
    verification_file = models.FileField(
        _("Vefizierungsdatei"), upload_to=tutor_upload_path, null=True)

    def __str__(self):
        return str(self.user)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_("E-Mail"), max_length=254, unique=True)
    # UUID field for identification in e.g. BBB-Service (also possibly shadow-accounts for LIMITED!!! access)
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    state = models.ForeignKey(State, on_delete=models.PROTECT)
    first_name = models.CharField(_("Vorname"), max_length=50, blank=False)
    last_name = models.CharField(_("Nachname"), max_length=50, blank=True)

    # gender-specific
    MALE = 'MA'
    FEMALE = 'FE'
    DIVERSE = 'DI'
    GENDER_CHOICES = [
        (MALE, 'männlich'),
        (FEMALE, 'weiblich'),
        (DIVERSE, 'divers')
    ]

    gender = models.CharField(
        _("Geschlecht"), max_length=2, choices=GENDER_CHOICES)

    # Define Django properties
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'state']
    objects = CustomUserManager()

    def __str__(self):
        return self.email + ' <{}>'.format(self.uuid)
