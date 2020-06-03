from django.apps import AppConfig




class NotifyConfig(AppConfig):
    name = 'notify'

    def ready(self):
       """ from post_office.models import EmailTemplate
        if not EmailTemplate.objects.filter(name='notification').exists():
            EmailTemplate.objects.create(
                name='notification', content=DEFAULT_PUSH_TXT, html_content=DEFAULT_PUSH_HTML, subject="naklar.io - {{ subject }}", description="Standard-Template für PUSH-Notifications")
""""