# SPDL

To be able to interact with spotify API, you need to create an app in [Spotify dashboard](https://developer.spotify.com/dashboard/) (you don't need a premium account for this). You can call the app anything you want. <br/>
Then go to app's settings, and do two things:

1. Copy Client ID into spdl's settings
2. Add this to Redirect URIs

- http://localhost:61624/

## Install dependencies

```bash
npm install
```

## Run a development instance

```bash
quasar dev -m electron
```

## Build

```bash
quasar build -m electron
```
