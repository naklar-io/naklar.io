FROM python:3.8
ENV PYTHONUNBUFFERED 1
RUN useradd -ms /bin/bash --home-dir /code naklario

COPY ./naklar-io /code/naklar-io
COPY Pipfile Pipfile.lock /code/naklar-io/

# WORKDIR /code

RUN pip install pipenv
RUN chown -R naklario /opt /code

# RUN rm -f /code/naklar-io/naklario/settings_local.py

USER naklario
WORKDIR /code/naklar-io

RUN pipenv install --deploy --ignore-pipfile


RUN pipenv run python manage.py collectstatic --noinput
