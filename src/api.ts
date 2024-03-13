// Import the express module
import express from 'express';
import { getSheets } from './scraper.js';
import { createPdf } from './converter.js';
import path from 'path';
import fs from 'fs';

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  // Access the URL from query parameters: /url?url=https://example.com
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('A string URL query parameter is required');
  }

  const svgUrls: string[] = await getSheets(url)
    .then((urls) => {
      return urls;
    })

  console.log(svgUrls);

  res.setHeader('Content-Type', 'application/pdf');

  try {
    await createPdf(svgUrls);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error creating pdf');
  }

  const filePath = path.join(process.cwd(), 'sheets.pdf');
  const stream = fs.createReadStream(filePath);

  res.setHeader('Content-Type', 'application/pdf');

  stream.pipe(res).on('error', (err) => {
    console.error('Error streaming the file:', err);
    res.status(500).send('Error sending the file');
  });

})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
