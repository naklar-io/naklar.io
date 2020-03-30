from django.core.management.base import BaseCommand, CommandError

from account.models import State, SchoolType, Subject, SchoolData

SUBJECTS = ["Deutsch", "Mathematik", "Englisch", "Französisch", "Latein", "Physik", "Chemie", "Biologie", "Musik", "Geschichte", "Geographie", "Wirtschaft/Recht", "Informatik"]
MAX_GRADES = {"Gymnasium": 13, "Realschule": 10, "Mittelschule": 10, "FOS/BOS": 13}
STATES = {"Baden-Württemberg": "BW",
          "Bayern": "BY",
          "Berlin": "BE",
          "Brandenburg": "BB",
          "Hamburg": "HH",
          "Hessen": "HE",
          "Mecklenburg-Vorpommern": "MV",
          "Niedersachsen": "NI",
          "Nordrhein-Westfalen": "NW",
          "Rheinland-Pfalz": "RP",
          "Saarland": "SL",
          "Sachsen": "SN",
          "Sachsen-Anhalt": "ST",
          "Schleswig-Holstein": "SH",
          "Thüringen": "TH"}


class Command(BaseCommand):
    help = 'populates DB with default values'

    def handle(self, *args, **options):
        # create states
        for state, short in STATES.items():
            sobj = State(name=state, shortcode=short)
            sobj.save()

        # Create School-types and schooldata for each grade
        for stype, max_grade in MAX_GRADES.items():
            typeobj = SchoolType(name=stype)
            typeobj.save()
            for i in range(5, max_grade+1):
                dataobj = SchoolData(school_type=typeobj, grade=i)
                dataobj.save()

        # create subjects
        for subj in SUBJECTS:
            subjobj = Subject(name=subj)
            subjobj.save()

