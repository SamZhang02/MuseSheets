# MuseSheets

Generate MuseScore sheet PDFs either directly from the CLI or by running a small HTTP service.

## Setup
Install dependencies once:

```shell
npm install
```

Build the TypeScript sources before running either mode:

```shell
npm run build
```

## How it works
The tool works by spawning a headless browser and scrolling through the entire page and scrapes the music sheet SVGs from the DOM. You can use it from a CLI or spawn a server for it. 

## CLI usage
Expose the CLI once with `npm link` (or `npm install -g .` if you prefer a global install) and then call it with the friendly `musesheets` command:

```shell
npm run build
npm link
musesheets <musescore-url> [output-file]
```

Example:

```shell
musesheets https://musescore.com/classicman/scores/106022 la_campanella.pdf
```

If no output file is provided the PDF defaults to `sheets.pdf` in the current working directory. You can still run the CLI without linking via `npm run cli -- <args>` or `node dist/index.js <args>` if you prefer.

## Server usage
Start (or hot-reload) the server with:

```shell
npm run start
```

Or run it directly without nodemon:

```shell
node dist/index.js --server [--port 4000]
```

Then hit the HTTP endpoint with the MuseScore URL as a query parameter:

```shell
curl "http://localhost:3000/?url=https://musescore.com/classicman/scores/106022" --output la_campanella.pdf
```

## Disclaimer
This is not an official MuseScore product. 
