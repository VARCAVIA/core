// src/api.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// Carica tutti i documenti indicizzati (JSON singoli) e l'indice
const indexedDir = 'indexed';
const indexData = JSON.parse(
  await fs.readFile(path.join(indexedDir, 'index.json'), 'utf8')
);

// Costruisci lunr in modalità compatibile
const idx = lunr.Index.load(indexData);

// Carica tutti i documenti indicizzati in memoria
const files = await fs.readdir(indexedDir);
const data = [];
for (const file of files) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const doc = JSON.parse(await fs.readFile(path.join(indexedDir, file), 'utf8'));
  // Ricava timestamp dal file system
  const stat = await fs.stat(path.join(indexedDir, file));
  data.push({
    ...doc,
    hash: doc.hash, // già presente da indexer.js
    timestamp: stat.birthtime.toISOString(), // creazione file
  });
}

// Funzione preview “demo ready”
function makePreview(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text.slice(0, 180) + "...";
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end);
  snippet = snippet.replace(
    new RegExp(keyword, 'gi'),
    match => `***${match}***`
  );
  return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
}

app.use(cors());

app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  if (!query.trim()) return res.json([]);

  const results = idx.search(query);
  const out = results.map(({ ref }) => {
    const doc = data.find(d => d.id === ref);
    return {
      id: doc.id,
      hash: doc.hash,
      timestamp: doc.timestamp,
      preview: makePreview(doc.text, query),
      title: doc.text.slice(0, 120).replace(/\s+/g, " ") + "...",
      source: doc.id,
    };
  });
  res.json(out);
});

app.listen(PORT, () =>
  console.log(`🚀 API pronta su http://localhost:${PORT}/api/search?q=...`)
);
