from django.db.models import Manager, QuerySet


class TimeSlotManager(Manager):
    def __init__(self, *args, **kwargs):
        self.alive_only = kwargs.pop('alive_only', False)
        super(TimeSlotManager, self).__init__(*args, **kwargs)

    def get_queryset(self):
        if self.alive_only:
            return TimeSlotQuerySet(self.model).filter(deleted=False)
        return TimeSlotQuerySet(self.model)

    def hard_delete(self):
        self.get_queryset().hard_delete()


class TimeSlotQuerySet(QuerySet):
    def delete(self):
        super(TimeSlotQuerySet, self).update(deleted=True)

    def hard_delete(self):
        super(TimeSlotQuerySet, self).delete()