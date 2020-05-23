FROM python:3.7
ENV PYTHONUNBUFFERED 1
RUN useradd -ms /bin/bash --home-dir /code naklario

COPY requirements.txt /code/
COPY ./naklar-io /code/naklar-io

WORKDIR /code

RUN pip install -r requirements.txt
RUN chown -R naklario /opt /code
RUN rm -f /code/naklar-io/naklario/settings_local.py

USER naklario
WORKDIR /code/naklar-io


RUN python3 manage.py collectstatic --noinput
