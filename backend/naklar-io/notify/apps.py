from django.apps import AppConfig


class NotifyConfig(AppConfig):
    name = 'notify'

    def ready(self):
        from notify import actions
        a = actions.ActionManager()
