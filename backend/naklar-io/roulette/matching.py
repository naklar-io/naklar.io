from datetime import timedelta

from django.utils import timezone
from push_notifications.models import WebPushDevice

from account.models import CustomUser
from roulette.models import Match, StudentRequest, TutorRequest
from django.db.models import F, Q
from notify.models import Notification, NotificationSettings


def look_for_matches():
    """looks through all student requests and tries to find a matching tutor request

    Might need significant performance improvements in the future (look at caching)
    """

    student_rs = StudentRequest.objects.prefetch_related('failed_matches', 'user__studentdata').filter(is_active=True).filter(
        meeting__isnull=True).filter(match__isnull=True)
    for student_request in student_rs:
        student = student_request.user
        tutor_rs = TutorRequest.objects.filter(is_active=True).filter(
            meeting__isnull=True).filter(match__isnull=True)

        # filter subjects
        tutor_rs = tutor_rs.filter(
            user__tutordata__subjects=student_request.subject)
        # filter out student failed matches:
        tutor_rs = tutor_rs.exclude(
            user__in=student_request.failed_matches.all())
        # filter out tutor failed_matches:
        tutor_rs = tutor_rs.exclude(failed_matches=student)

        # TODO: Maybe enable dynamically? Disabled for now
        # Match schooldata
        # tutor_rs = tutor_rs.filter(user__tutordata__schooldata=student.studentdata.school_data)

        if tutor_rs.exists():
            # now we have hopefully limited the amount of requests to a minimum
            # we will now calculate a score for all of them and choose the best.
            best_tutor = max(tutor_rs, key=lambda tutor_request: calculate_request_matching_score(
                student_request, tutor_request))
            Match.objects.create(
                student_request=student_request, tutor_request=best_tutor)


def generate_notifications():
    """looks through all student requests, older than 20 secs, find offline tutors and send notification if allowed and interval is OKAY

    """
    # filter relevant student requests
    student_rs = StudentRequest.objects.filter(
        is_active=True,
        meeting__isnull=True,
        match__isnull=True,
        created__lte=timezone.now()-timedelta(seconds=5)
    )

    # TODO: first step is to filter student requests that have no notifications sent yet?
    # next would be, filter only the ones that havent sent notifications in X seconds
    student_rs = student_rs.filter(Q(notifications__isnull=True) |
                                   Q(notifications__date__lte=timezone.now() - timedelta(seconds=10))).prefetch_related('user', 'subject', 'notifications').distinct()
    # TODO: prioritize those with longer waiting times
    # student_rs = student_rs.order_by(
    # fetch possible tutors beforehand, reducing the query complexity each step

    # Find matching tutors
    # this may need to be optimized further --> Selecting whole user table!
    all_tutors = CustomUser.objects.prefetch_related('tutordata').filter(
        tutordata__isnull=False, email_verified=True, tutordata__verified=True,
        notificationsettings__isnull=False)

    # find those who have notifications turned on and interval is okay
    all_tutors = all_tutors.filter(
        Q(notificationsettings__enable_push=True) | Q(
            notificationsettings__enable_mail=True)).exclude(
        notification__date__gte=timezone.now() - F('notificationsettings__notify_interval')).distinct()

    time_range_query = Q(notificationsettings__ranges__days__contains=timezone.datetime.today().weekday(),
                         notificationsettings__ranges__start_time__lte=timezone.now().time(),
                         notificationsettings__ranges__end_time__gte=timezone.now().time())

    # now to find those whose time is in range
    all_tutors = all_tutors.filter((Q(notificationsettings__ranges_mode=NotificationSettings.RANGE_ALLOW) & time_range_query) | Q(
        Q(notificationsettings__ranges_mode=NotificationSettings.RANGE_BLOCK) & ~time_range_query)).distinct()

    # don't do anything if there arent any student requests
    if not student_rs:
        return
    # all_tutors = list(all_tutors)
    for request in student_rs:

        # filter again for those who didn't already get a notification for the same request
        tutors = all_tutors.filter(tutordata__subjects=request.subject).exclude(
            notification__in=request.notifications.all())
            #.exclude(notification__date__gte=timezone.now() - F('notificationsettings__notify_interval')).distinct()

        # now to find the 10 best!
        sorted_tutors = sorted(tutors, key=lambda tutor: calculate_user_matching_score(
            request, tutor))[::-1][:10]
        for t in sorted_tutors:
            notification = Notification()
            notification.user = t
            notification.type = Notification.STUDENT_REQUEST
            notification.title = f"{request.user.first_name} braucht deine Hilfe!"
            notification.body = f"Fach: {request.subject.name} in {str(request.user.studentdata.school_data)}"
            notification.content_object = request
            notification.save()
            notification.send()

            # notification.body =


def calculate_request_matching_score(student_request: StudentRequest, tutor_request: TutorRequest):
    return calculate_user_matching_score(student_request, tutor_request.user)


def calculate_user_matching_score(student_request: StudentRequest, tutor: CustomUser):
    score = 1
    student = student_request.user
    if student.state == tutor.state:
        score += 5
    if student.gender == tutor.gender:
        score += 3
    if student.studentdata.school_data in tutor.tutordata.schooldata.all():
        score += 10
    return score
