from django import template
from django.conf import settings

register = template.Library()


@register.simple_tag
def dashboard_url():
    return f"{settings.HOST}/dashboard"


@register.simple_tag
def appointment_answer_url(id):
    return f"{settings.HOST}/scheduling/appointment/{id}/answer"
