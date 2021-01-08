FROM python:3.9
ENV PYTHONUNBUFFERED 1
RUN useradd -ms /bin/bash --home-dir /code naklario

RUN pip install -U pip && pip install pipenv

COPY Pipfile Pipfile.lock /code/

WORKDIR /code
USER naklario
RUN pipenv install --deploy --ignore-pipfile

COPY --chown=naklario ./naklar-io /code/naklar-io
WORKDIR /code/naklar-io
COPY --chown=naklario ./docker/.env.collectstatic ../.env
RUN pipenv run ./manage.py collectstatic --noinput
RUN rm ../.env
ENTRYPOINT ["pipenv", "run"]
CMD ["python", "-m", "daphne", "-b", "0.0.0.0", "-p", "8000", "naklario.asgi:application"]
