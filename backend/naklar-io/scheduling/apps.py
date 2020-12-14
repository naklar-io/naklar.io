from django.apps import AppConfig


class SchedulingConfig(AppConfig):
    name = 'scheduling'

    def ready(self):
        print("Loading signals")
        from scheduling import signals
        print(signals, " loaded")
