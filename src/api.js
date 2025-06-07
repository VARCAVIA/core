// src/api.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const indexedDir = 'indexed';
const app = express();
const PORT = 3000;

// Carica dati e indice
const data = [];
const files = await fs.readdir(indexedDir);
for (const file of files) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const doc = JSON.parse(await fs.readFile(path.join(indexedDir, file), 'utf8'));
  data.push(doc);
}
const idxRaw = JSON.parse(await fs.readFile(path.join(indexedDir, 'index.json'), 'utf8'));
const idx = lunr.Index.load(idxRaw);

// Preview migliorata e pulita
function makePreview(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text.replace(/[\r\n\t ]+/g, ' ').slice(0, 180) + "...";
  // Finestra 80+80, parola evidenziata
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end).replace(/[\r\n\t ]+/g, ' ');
  snippet = snippet.replace(new RegExp(keyword, 'gi'), match => `***${match}***`);
  return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
}

// Endpoint ricerca
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  if (!query) return res.json([]);
  const results = idx.search(query);
  const out = results.map(({ ref }) => {
    const doc = data.find(d => d.id === ref);
    return {
      id: doc.id,
      preview: makePreview(doc.text, query)
    };
  });
  res.json(out);
});

app.listen(PORT, () => {
  console.log(`🚀 API pronta su http://localhost:${PORT}/search?q=YOUR_KEYWORD`);
});
