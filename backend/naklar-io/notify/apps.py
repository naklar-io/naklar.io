from django.apps import AppConfig

DEFAULT_PUSH_TXT = """{{ msg }}

Viele Grüße
Dein Team von naklar.io

-----------------------

Du erhältst diese Nachricht, da du Benachrichtigungen auf naklar.io aktiviert hast.
"""
DEFAULT_PUSH_HTML = """{{ msg }}
<br>
<br>
<p>
Viele Grüße<br>
Dein Team von naklar.io<br>
<br>
<hr>
<br>
Du erhältst diese Nachricht, da du Benachrichtigungen auf naklar.io aktiviert hast.
</p>
"""


class NotifyConfig(AppConfig):
    name = 'notify'

    def ready(self):
        from post_office.models import EmailTemplate
        if not EmailTemplate.objects.filter(name='notification').exists():
            EmailTemplate.objects.create(
                name='notification', content=DEFAULT_PUSH_TXT, html_content=DEFAULT_PUSH_HTML, subject="naklar.io - {{ subject }}", description="Standard-Template für PUSH-Notifications")
