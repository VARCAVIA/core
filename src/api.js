// src/api.js
import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';
import lunr from 'lunr';

const app = express();
app.use(cors());

const indexData = JSON.parse(await fs.readFile('indexed/index.json', 'utf8'));
const idx = lunr.Index.load(indexData);

const docs = [];
const files = await fs.readdir('indexed');
for (const file of files) {
  if (file.endsWith('.json') && file !== 'index.json') {
    docs.push(JSON.parse(await fs.readFile('indexed/' + file, 'utf8')));
  }
}

function parseAdvancedQuery(query) {
  // Esempio: "source:eba title:bank regolamento"
  const filters = {};
  let mainQuery = [];
  for (const part of query.split(' ')) {
    const match = part.match(/^(\w+):(.+)$/);
    if (match) {
      filters[match[1].toLowerCase()] = match[2].toLowerCase();
    } else {
      mainQuery.push(part);
    }
  }
  return { filters, q: mainQuery.join(' ').trim() };
}

function makePreview(text, keyword) {
  if (!text) return '';
  if (!keyword) return text.slice(0, 180) + '...';
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text.slice(0, 180) + '...';
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end);
  snippet = snippet.replace(new RegExp(keyword, 'gi'), m => `***${m}***`);
  return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
}

app.get('/search', (req, res) => {
  const query = req.query.q || '';
  const { filters, q } = parseAdvancedQuery(query);

  // Lunr cerca su tutti i campi
  const results = idx.search(q || '*');
  let filtered = results.map(r => docs.find(d => d.id === r.ref));

  // Filtro avanzato su metadati
  for (const key in filters) {
    filtered = filtered.filter(doc =>
      doc[key] && doc[key].toLowerCase().includes(filters[key])
    );
  }

  res.json(filtered.map(doc => ({
    id: doc.id,
    title: doc.title,
    source: doc.source,
    date: doc.date,
    hash: doc.hash,
    timestamp: doc.timestamp,
    preview: makePreview(doc.text, q)
  })));
});

app.listen(3000, () => {
  console.log('🔗 API server running on http://localhost:3000');
});
