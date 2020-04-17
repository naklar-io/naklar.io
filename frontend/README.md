# Naklar.io Frontend

## Local Development

To Start the dev server for the Angular 9 frontend follow these steps:

```bash
# navigate to project root (containing package.json)
$ cd frontend/naklario
# globally install angular cli
$ npm install -g @angular/cli

```

Locally install required packages

```bash
$ npm install
```

Start the dev server. Can optionally specify the `--host` with `0.0.0.0` to serve the app on the local network

```bash
$ ng serve --host 0.0.0.0
```

Now the application is available @ http://localhost:4200

## Deployment

To deploy your changes to https://dev.naklar.io push your changes to the `origin/deploy` branch. 
Then shh into the naklar.io server at (requires your public key to be added by @nysler): 
```bash
$ ssh root@dev.naklar.io
# change to web user account
$ su - web
# run the build script to pull origin/deploy branch, compile and copy static assets
$ ./build.sh
# changes on origin/deploy are now live
```
