// src/api.js

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());

const INDEX_DIR = 'indexed';

app.get('/search', async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    const source = req.query.source;
    const period = req.query.period;
    let allResults = [];

    const files = await fs.readdir(INDEX_DIR);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const content = await fs.readFile(path.join(INDEX_DIR, file), 'utf-8');
      let data;
      try {
        data = JSON.parse(content);
      } catch (e) {
        continue; // Salta file malformati
      }
      // Data può essere array o oggetto singolo: normalizza sempre ad array
      const docs = Array.isArray(data) ? data : [data];
      allResults.push(...docs);
    }

    // Ora allResults è sempre un array
    let results = allResults;

    if (q) {
      results = results.filter(doc =>
        doc.preview?.toLowerCase().includes(q) ||
        doc.title?.toLowerCase().includes(q) ||
        doc.id?.toLowerCase().includes(q)
      );
    }
    if (source && source !== 'all') {
      results = results.filter(doc => doc.source === source);
    }
    // (Aggiungi qui eventuali filtri periodo ecc.)

    res.json(results);
  } catch (error) {
    // Log su file (opzionale), qui solo stdout
    console.error({ ts: new Date().toISOString(), event: 'error', error: error.message });
    res.status(500).json({ error: 'API error' });
  }
});

app.listen(3000, () => {
  console.log('API running on http://localhost:3000');
});
