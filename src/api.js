// src/api.js

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const INDEX_DIR = 'indexed';
const PUBLIC_DIR = 'public';

// 1) Abilita CORS
app.use(cors());

// 2) Servi la UI statica
app.use(express.static(PUBLIC_DIR));

// 3) Endpoint di ricerca
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    const source = req.query.source;
    // (se useremo filtro periodo in futuro:) const period = req.query.period;

    // Carica tutti i documenti JSON
    const files = await fs.readdir(INDEX_DIR);
    let allResults = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const content = await fs.readFile(path.join(INDEX_DIR, file), 'utf-8');
      let data;
      try {
        data = JSON.parse(content);
      } catch {
        continue; // salta JSON malformati
      }
      // Normalizza sempre ad array
      const docs = Array.isArray(data) ? data : [data];
      allResults.push(...docs);
    }

    // Filtri
    let results = allResults;
    if (q) {
      results = results.filter(doc =>
        (doc.preview  || '').toLowerCase().includes(q) ||
        (doc.title    || '').toLowerCase().includes(q) ||
        (doc.source   || '').toLowerCase().includes(q)
      );
    }
    if (source && source !== 'all') {
      results = results.filter(doc => doc.source === source);
    }

    res.json(results);
  } catch (error) {
    console.error({ ts: new Date().toISOString(), event: 'error', error: error.message });
    res.status(500).json({ error: 'API error' });
  }
});

// 4) Catch-all per SPA (opzionale: riporta sempre index.html)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(PUBLIC_DIR, 'index.html'));
});

// 5) Avvia il server
app.listen(PORT, () => {
  console.log(`🔗 API+UI server running at http://localhost:${PORT}`);
});
