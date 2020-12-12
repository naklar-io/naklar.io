FROM python:3.9
ENV PYTHONUNBUFFERED 1
RUN useradd -ms /bin/bash --home-dir /code naklario

RUN chown -R naklario /opt /code

RUN pip install pipenv
USER naklario

COPY Pipfile Pipfile.lock /code/

WORKDIR /code

RUN pipenv install --deploy --ignore-pipfile --system

COPY ./naklar-io /code/naklar-io
WORKDIR /code/naklar-io

RUN ./manage.py collectstatic --noinput
