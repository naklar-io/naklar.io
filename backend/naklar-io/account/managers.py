from django.contrib.auth.models import BaseUserManager
from django.apps import apps


class CustomUserManager(BaseUserManager):

    def create_user(self, email, first_name, state, password=None, **extra_fields):
        State = apps.get_model('account.State')
        if not isinstance(state, State):
            state = State(pk=state)
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, state=state, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, first_name, state, password=None, **extra_fields):
        State = apps.get_model('account.State')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, state=State(pk=state), **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        return user
