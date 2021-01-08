from django.core.management.base import BaseCommand, CommandError

from account.managers import CustomUserManager
from account.models import SchoolData, SchoolType, State, Subject, CustomUser, TutorData, StudentData

SUBJECTS = ["Deutsch", "Mathematik", "Englisch", "Französisch", "Latein", "Physik", "Chemie",
            "Biologie", "Musik", "Geschichte", "Geographie", "Wirtschaft/Recht", "Informatik"]
MAX_GRADES = {"Gymnasium": 13, "Realschule": 10,
              "Mittelschule": 10, "FOS/BOS": 13}
STATES = {"Baden-Württemberg": "BW",
          "Bayern": "BY",
          "Berlin": "BE",
          "Brandenburg": "BB",
          "Bremen": "HB",
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

    def add_arguments(self, parser):
        parser.add_argument('--superuser', action='store_true', help="Create superuser?")

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

        if options['superuser']:
            CustomUser.objects.create_superuser('kstein@inforbi.de', 'Korbinian', 1, '12345678')

        # create tutor account
        tutor = CustomUser.objects.create_user('tutor@inforbi.de', 'TestTutor', 1, '12345678', email_verified=True, gender='MA')
        tutordata = TutorData.objects.create(user=tutor, verified=True)
        tutordata.subjects.add(*Subject.objects.all())
        tutordata.schooldata.add(*SchoolData.objects.all())
        print(tutor)

        # create student account
        student = CustomUser.objects.create_user('schueler@inforbi.de', 'TestSchüler', 1, '12345678', email_verified=True, gender='MA')
        studentdata = StudentData.objects.create(user=student, school_data=SchoolData.objects.order_by('?')[0])
        print(student)
