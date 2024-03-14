# MuseSheets

HTTP API to download MuseScore sheets without membership.

## Usage
The entrypoint of the code is `src/api.ts`. 

Start the server with 

```shell
npm run start
```

And then query the API with a musescore url, an example with curl: 

```
curl http://localhost:3000/?url=https://musescore.com/classicman/scores/106022 --output la_campanella.pdf
```

## Disclaimer
This is not an official MuseScore product. 
