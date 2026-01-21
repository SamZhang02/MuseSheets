import PDFDocument from "pdfkit";
import svgtopdf, { SVGtoPDFOptions } from "svg-to-pdfkit";
import fs from "fs";
import path from "path";

// Browser like headers to bypass cloudflare
const downloadSVG = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "image/svg+xml,text/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://musescore.com/",
    },
  });

  return response.text();
};

// Downgrade Tiny 1.2 SVGs to 1.1 Full so svg-to-pdfkit can parse them.
const downgradeTinySvg = (svgContent: string): string => {
  const svgTagMatch = svgContent.match(/<svg\b[^>]*>/i);
  if (!svgTagMatch) {
    return svgContent;
  }

  const svgTag = svgTagMatch[0];
  const isTinyBaseProfile = /baseProfile\s*=\s*(['"])tiny\1/i.test(svgTag);
  const isVersionOneTwo = /version\s*=\s*(['"])1\.2\1/i.test(svgTag);

  if (!isTinyBaseProfile || !isVersionOneTwo) {
    return svgContent;
  }

  const replaceAttributeValue = (
    tag: string,
    attribute: string,
    value: string,
  ) =>
    tag.replace(
      new RegExp(`(${attribute}\\s*=\\s*)(['"])([^'"]*)\\2`, "i"),
      (_match, prefix: string, quote: string) =>
        `${prefix}${quote}${value}${quote}`,
    );

  const updatedTag = replaceAttributeValue(
    replaceAttributeValue(svgTag, "version", "1.1"),
    "baseProfile",
    "full",
  );

  return svgContent.replace(svgTag, updatedTag);
};

export const createPdf = async (
  svgUrls: string[],
  outputPath = path.join(process.cwd(), "sheets.pdf"),
): Promise<string> => {
  console.log(svgUrls);
  const doc = new PDFDocument();
  const resolvedPath = path.resolve(outputPath);
  const writeStream = fs.createWriteStream(resolvedPath);
  doc.pipe(writeStream);

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanupAndReject = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      if (!writeStream.closed) {
        writeStream.destroy();
      }
      doc.end();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const resolveOnce = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(resolvedPath);
    };

    writeStream.on("finish", resolveOnce);
    writeStream.on("error", cleanupAndReject);
    doc.on("error", cleanupAndReject);

    (async () => {
      try {
        for (const [index, url] of svgUrls.entries()) {
          let svgContent = await downloadSVG(url);
          console.log(`from ${url}, got content: ${svgContent}`);

          const options: SVGtoPDFOptions = {
            preserveAspectRatio: "xMinYMin meet",
            width: doc.page.width,
            height: doc.page.height,
          };

          svgtopdf(
            doc,
            svgContent,
            20, // magic number to center the svg
            0,
            options,
          );

          if (index < svgUrls.length - 1) {
            doc.addPage();
          }
        }
      } catch (error) {
        cleanupAndReject(error);
        return;
      }

      doc.end();
    })();
  });
};
