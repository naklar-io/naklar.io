import os
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core import validators
from django.core.mail import EmailMultiAlternatives
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template import Context
from django.template.loader import get_template
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from account.managers import CustomUserManager

EMAIL_VERIFICATION_PLAINTEXT = get_template("email_verification.txt")
EMAIL_VERIFICATION_HTMLY = get_template("email_verification.html")


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


def profile_upload_path(instance, filename):
    return 'tutor-pics/{0}{1}'.format(instance.user.uuid, os.path.splitext(filename)[1])


class TutorData(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)

    schooldata = models.ManyToManyField(
        SchoolData, verbose_name=_("Mögliche Schultypen/Klassenstufen"))
    subjects = models.ManyToManyField(Subject, verbose_name=_("Fächer"))

    verified = models.BooleanField(_("Verifiziert"), default=False)
    verification_file = models.FileField(
        _("Vefizierungsdatei"), upload_to=tutor_upload_path, null=True)

    profile_picture = models.ImageField(
        _("Profilbild"), upload_to=profile_upload_path, null=True)

    def __str__(self):
        return str(self.user)

    def image_tag(self):
        return mark_safe('<img src="/media/%s" width="256" height="256" />' % (self.profile_picture))

    image_tag.short_description = 'Image'


class VerificationToken(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created = models.DateTimeField(_("Erstellt"), auto_now_add=True)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_("E-Mail"), max_length=254, unique=True)
    email_verified = models.BooleanField(_("E-Mail bestätigt"), default=False)
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

    def send_verification_email(self):
        if not self.email_verified:
            token = VerificationToken.objects.get_or_create(user=self)[0]
            subject, from_email, to = "E-Mail-Bestätigung für naklar.io", "noreply@naklar.io", self.email
            d = {
                'user': self,
                'verification_url': settings.HOST + "/account/verify?token=" + str(token.token)
            }
            text_content = EMAIL_VERIFICATION_PLAINTEXT.render(d)
            html_content = EMAIL_VERIFICATION_HTMLY.render(d)
            msg = EmailMultiAlternatives(
                subject, text_content, from_email, [to])
            msg.attach_alternative(html_content, "text/html")
            msg.send()

    def check_email_verification(self, check_token):
        if str(self.verificationtoken.token) == str(check_token):
            self.email_verified = True
            self.verificationtoken.delete()
            self.save()
            return True
        else:
            return False

    def __str__(self):
        return self.email + ' <{}>'.format(self.uuid)


@receiver(post_save, sender=CustomUser)
def send_verify_on_creation(sender, instance, created, **kwargs):
    if created:
        instance.send_verification_email()
