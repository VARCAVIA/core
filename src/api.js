// src/api.js
import express from 'express';
import fs from 'fs/promises';
import lunr from 'lunr';

const indexedPath = 'indexed/index.json';
const docsDir = 'indexed';

const app = express();
const port = 3000;

// Carica indice e documenti
const idxData = JSON.parse(await fs.readFile(indexedPath, 'utf8'));
const idx = lunr.Index.load(idxData);

const files = await fs.readdir(docsDir);
const data = [];
for (const file of files) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const doc = JSON.parse(await fs.readFile(`${docsDir}/${file}`, 'utf8'));
  data.push(doc);
}

// Funzione preview migliorata
function makePreview(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text.slice(0, 180) + "...";
  // Estrae 80 caratteri prima e 80 dopo la parola trovata
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end);
  // Evidenzia la parola chiave con ***
  snippet = snippet.replace(
    new RegExp(keyword, 'gi'),
    match => `***${match}***`
  );
  return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
}

// Endpoint di ricerca
app.get('/search', (req, res) => {
  const query = req.query.q;
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

app.listen(port, () => {
  console.log(`🚀 API attiva su http://localhost:${port}`);
});
