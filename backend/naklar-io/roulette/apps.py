import os

from django.apps import AppConfig


class RouletteConfig(AppConfig):
    name = 'roulette'

    def ready(self):
        pass
"""         from . import jobs
        if os.environ.get('RUN_MAIN', None) != 'true':
            jobs.start_scheduler() """
