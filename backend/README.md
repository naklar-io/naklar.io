# naklar.io - Backend 
Django-Implementierung von naklar.io

## Entwicklungsumgebung
Benötigt:
  - Docker
  - Docker-Compose
  - python3
  - pipenv (`pip3 install pipenv`)

## Konfiguration
Kopieren des Beispiel .env
```shell script
$ cp .env.example .env
```
--> Anpassen der ``.env``-Datei mit den benötigten Parametern
### Je nach Deployment:
 - Einlesen von .env in environment variables
 - Direktes Nutzen der angegebenen Variablen
 
## Deploy 
```
# mit externem redis, postgres und minio
$ docker-compose -f docker-compose.yml 

# mit internem redis, postgres und minio
$ docker-compose -f docker-compose.yml 
```
## Entwicklungsserver
do
`python manage.py runserver`
