from django.core.management.base import BaseCommand, CommandError

from account.models import State, SchoolType, Subject

SUBJECTS = ["Biologie", "Mathematik", "Chemie", "Physik"]

class Command(BaseCommand):
    help = 'populates DB with default values'

    def handle(self, *args, **options):
        # create states
        s = State(name="Bayern", shortcode="BY")
        s.save()
        # create schooltypes
        s = SchoolType(name="Gymnasium")
        s.save()
        s = SchoolType(name="Realschule")
        s.save()
        s = SchoolType(name="Mittelschule")
        # subject
        for s in SUBJECTS:
            sx = Subject(name=s)
            sx.save()
        
