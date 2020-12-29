from django.apps import apps
from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.db.models import Manager, Q
from django.db.models.manager import BaseManager


class CustomUserManager(BaseUserManager):

    def create_user(self, email, first_name, state, password=None, **extra_fields):
        # Convert email to lower case.
        email = email.lower()
        State = apps.get_model('account.State')
        if not isinstance(state, State):
            state = State(pk=state)
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name,
                          state=state, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, first_name, state, password=None, **extra_fields):
        State = apps.get_model('account.State')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name,
                          state=State(pk=state), **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        return user

    def get_by_natural_key(self, email):
        return self.get(email__iexact=email)


class AvailableCodeManager(Manager):
    def get_queryset(self):
        from scheduling.models import Appointment
        return super(AvailableCodeManager, self).get_queryset().filter(
            used=False, meeting__isnull=True
        ).filter(
            Q(appointment__isnull=True) |
            Q(appointment__status__in=[Appointment.Status.OWNER_REJECTED,
                                       Appointment.Status.INVITEE_REJECTED])
        )
