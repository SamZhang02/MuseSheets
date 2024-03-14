# MuseSheets

HTTP API to download MuseScore sheets without membership.

## Usage
The entrypoint of the code is `src/api.ts`. 

First install all dependencies with 

```shell
num install
```

Then start the server with 

```shell
npm run start
```

We now have an endpoint that we can query with a musescore url, an example with curl: 

```
curl http://localhost:3000/?url=https://musescore.com/classicman/scores/106022 --output la_campanella.pdf
```

## Disclaimer
This is not an official MuseScore product. 
