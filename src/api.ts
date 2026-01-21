import express, { Express } from 'express';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import { getSheets } from './scraper.js';
import { createPdf } from './converter.js';

const PDF_FILENAME = 'sheets.pdf';

const buildApp = (): Express => {
  const app = express();

  app.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).send('A string URL query parameter is required');
      return;
    }

    console.log(`Received URL: ${url}`);

    try {
      const svgUrls = await getSheets(url);
      console.log('Successfully retrieved the SVG URLs');

      const outputPath = path.join(process.cwd(), PDF_FILENAME);
      await createPdf(svgUrls, outputPath);
      res.setHeader('Content-Type', 'application/pdf');

      const stream = fs.createReadStream(outputPath);
      stream.on('error', (err) => {
        console.error('Error streaming the file:', err);
        if (!res.headersSent) {
          res.status(500).send('Error sending the file');
        } else {
          res.end();
        }
      });

      stream.on('close', () => {
        void fs.promises.unlink(outputPath).catch(() => {});
      });

      stream.pipe(res);
      console.log('Successfully sent the file');
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Failed to generate the PDF');
    }
  });

  return app;
};

export const startServer = (port = Number(process.env.PORT) || 3000): Promise<Server> => {
  const app = buildApp();
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve(server);
    });
  });
};

export type { Express };
export { buildApp };
