import PDFDocument from "pdfkit";
import svgtopdf, { SVGtoPDFOptions } from "svg-to-pdfkit";
import fs from "fs";

const downloadSVG = async (url: string) => {
  const response = await fetch(url);
  return response.text();
};

export const createPdf = async (svgUrls: string[]) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("sheets.pdf"));

  for (const url of svgUrls) {
    const svgContent = await downloadSVG(url);

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
    doc.addPage();
  }

  doc.end();
};
