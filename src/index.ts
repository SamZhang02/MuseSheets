#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import { createPdf } from "./converter.js";
import { getSheets } from "./scraper.js";
import { startServer } from "./api.js";

interface CliOptions {
  mode: "cli" | "server";
  url?: string;
  output?: string;
  port?: number;
  help?: boolean;
}

const printUsage = () => {
  console.log(
    `MuseSheets\n\n` +
      `CLI usage: musesheets <musescore-url> [output-file]\n` +
      `Server usage: musesheets --server [--port <port>]`,
  );
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = { mode: "cli" };
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--server":
      case "-s":
        options.mode = "server";
        break;
      case "--port":
      case "-p": {
        const value = argv[++i];
        if (!value) {
          throw new Error("Missing value for --port");
        }
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          throw new Error("Port must be a number");
        }
        options.port = parsed;
        break;
      }
      case "--output":
      case "-o": {
        const value = argv[++i];
        if (!value) {
          throw new Error("Missing value for --output");
        }
        options.output = value;
        break;
      }
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        positional.push(arg);
        break;
    }
  }

  if (options.mode === "cli") {
    options.url = positional[0];
    if (!options.output && positional[1]) {
      options.output = positional[1];
    }
  }

  return options;
};

const runCli = async (url: string, output?: string) => {
  console.log(`Fetching sheets from ${url}`);
  const svgUrls = await getSheets(url);
  console.log("Converting sheets to PDF...");
  const resolvedOutput = output ?? path.join(process.cwd(), "sheets.pdf");
  const filePath = await createPdf(svgUrls, resolvedOutput);
  console.log(`PDF saved to ${filePath}`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printUsage();
    return;
  }

  if (options.mode === "server") {
    await startServer(options.port);
    return;
  }

  if (!options.url) {
    printUsage();
    throw new Error("Missing <musescore-url> argument");
  }

  await runCli(options.url, options.output);
};

const entryPath = fileURLToPath(import.meta.url);
const invokedViaBin = (() => {
  const invokedPath = process.argv[1];
  if (!invokedPath) {
    return false;
  }
  const binName = path.basename(invokedPath).toLowerCase();
  return (
    binName === "musesheets" ||
    binName === "musesheets.cmd" ||
    binName === "musesheets.ps1"
  );
})();

if (process.argv[1] === entryPath || invokedViaBin) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
