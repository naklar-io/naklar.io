import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class SchedulingConfig(AppConfig):
    name = 'scheduling'

    def ready(self):
        logger.debug("Loading signals")
        from scheduling import signals
        logger.debug(f"loaded signals {signals}")
