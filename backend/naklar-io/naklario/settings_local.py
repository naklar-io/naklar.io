import os
# Add your own deployment overrides here

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BBB_SHARED = "CHANGETHIS" # TODO

# HOW TO GET KEY:
#   from django.core.management.utils import get_random_secret_key
#   get_random_secret_key()
SECRET_KEY = "CHANGETHIS" # TODO



API_HOST = "https://dev.api.naklar.io" # TODO
HOST = "https://dev.naklar.io" # TODO

# TODO 
CORS_ORIGIN_WHITELIST = [
    "http://localhost:4000",
]

# TODO
ALLOWED_HOSTS = ["*"]

PUSH_NOTIFICATIONS_SETTINGS = {
    "WP_PRIVATE_KEY": os.path.join(BASE_DIR, "private_key.pem"),
    "WP_CLAIMS": {
        "sub": "mailto:kstein@inforbi.de"
    }
}

# TODO
EMAIL_HOST = "smtpd"
EMAIL_PORT = "1025"

# TODO
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# TODO
WEBPUSH_SETTINGS = {
    "VAPID_PUBLIC_KEY": "Public Key",
    "VAPID_PRIVATE_KEY": "Private Key",
    "VAPID_ADMIN_EMAIL": "admin@example.org"
}
