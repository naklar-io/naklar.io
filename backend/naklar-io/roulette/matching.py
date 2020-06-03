from push_notifications.models import WebPushDevice

from roulette.models import Match, StudentRequest, TutorRequest


def look_for_matches():
    """looks through all student requests and tries to find a matching tutor request

    Might need significant performance improvements in the future (look at caching)
    """

    student_rs = StudentRequest.objects.filter(is_active=True).filter(meeting__isnull=True).filter(match__isnull=True)
    for student_request in student_rs:
        student = student_request.user
        tutor_rs = TutorRequest.objects.filter(is_active=True).filter(meeting__isnull=True).filter(match__isnull=True)

        # filter subjects
        tutor_rs = tutor_rs.filter(user__tutordata__subjects=student_request.subject)
        # filter out student failed matches:
        tutor_rs = tutor_rs.exclude(user__in=student_request.failed_matches.all())
        # filter out tutor failed_matches:
        tutor_rs = tutor_rs.exclude(failed_matches=student)

        # TODO: Maybe enable dynamically? Disabled for now
        # Match schooldata
        # tutor_rs = tutor_rs.filter(user__tutordata__schooldata=student.studentdata.school_data)

        if tutor_rs.exists():
            # now we have hopefully limited the amount of requests to a minimum
            # we will now calculate a score for all of them and choose the best.
            best_tutor = max(tutor_rs, key=lambda tutor_request: calculate_matching_score(student_request, tutor_request))
            Match.objects.create(student_request=student_request, tutor_request=best_tutor)

        
def calculate_matching_score(student_request: StudentRequest, tutor_request: TutorRequest):
    score = 1
    student = student_request.user
    tutor = tutor_request.user
    if student.state == tutor.state:
        score += 5
    if student.gender == tutor.gender:
        score += 3
    if student.studentdata.school_data in tutor.tutordata.schooldata.all():
        score += 10
    return score