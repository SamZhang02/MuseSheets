import PDFDocument from 'pdfkit';
import svgtopdf from 'svg-to-pdfkit';
import fs from 'fs';

const downloadSVG = async (url: string) => {
  const response = await fetch(url);
  return response.text();
};

export const createPdf = async (svgUrls: string[]) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('sheets.pdf'));

  for (const url of svgUrls) {
    const svgContent = await downloadSVG(url);
    svgtopdf(doc, svgContent, 0, 0);
    doc.addPage();
  }

  doc.end();
};

