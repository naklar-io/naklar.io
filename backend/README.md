# LernRoulette
Django-Implementierung von LernRoulette


## Entwicklungsumgebung
Benötigt:
  - python3
  - virtualenv (`pip3 install virtualenv`)
Erstellt euch ein virtualenv um die Requirements besser zu managen: `virtualenv <folder_name>`
Danach `source <foldername>/bin/activate.sh` (bzw. zsh, fish, je nach gewählter Shell)

Um die aktuellen reqs zu installieren (im VirtualEnv):
`pip3 install -r requirements.txt`

Wenn neue Requirements hinzukommen (via pip3 install ...):
`pip3 freeze > requirements.txt`

## Testserver starten
`python manage.py runserver`
