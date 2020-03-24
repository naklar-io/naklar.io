from django.core import validators
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid


class SchoolType(models.Model):
    name = models.TextField(_("Name des Schultyps"))
    def __str__(self):
        return self.name


class SchoolData(models.Model):
    school_type = models.ForeignKey(SchoolType)
    grade = models.IntegerField(_("Klasse"))
    def __str__(self):
        return str(self.school_type) + " - " + str(grade) + ". Klasse"


class State(models.Model):
    name = models.TextField(_("Name"))
    shortcode = models.CharField(_("Kurzbezeichnung"), max_length=2)
    def __str__(self):
        return self.name + " (%s)" % self.shortcode


class Subject(models.Model):
    name = models.TextField(_("Name"))
    def __str__(self):
        return self.name


class StudentData(models.Model):
    school_data = models.OneToOneField(SchoolData, _("Klasse und Schulart"))


class TutorData(models.Model):
    schooldata = models.ManyToManyField(SchoolData, verbose_name=_("Mögliche Schultypen/Klassenstufen"))
    subjects = models.ManyToManyField(Subject, verbose_name=_("Fächer"))


class User(AbstractUser):
    email = models.EmailField(_("E-Mail"), max_length=254, unique=True)
    state = models.ForeignKey(State, on_delete=models.PROTECT)
    first_name = models.CharField(_("Vorname"), max_length=50, blank=False)
    last_name = models.CharField(_("Nachname"), max_length=50, blank=True)

    student_data = models.ForeignKey(StudentData, on_delete=models.CASCADE, null=True)
    tutor_data = models.ForeignKey(TutorData, on_delete=models.CASCADE, null=True)