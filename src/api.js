// src/api.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const INDEX_DIR = 'indexed';
const PUBLIC_DIR = 'public';

// Funktion per creare lo snippet
function makePreview(text = '', keyword = '') {
  const lower = text.toLowerCase();
  const idx   = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) return text.slice(0, 180) + '…';
  const start = Math.max(0, idx - 80);
  const end   = Math.min(text.length, idx + keyword.length + 80);
  let snip = text.slice(start, end);
  // evidenzia
  snip = snip.replace(new RegExp(keyword, 'gi'), m => `***${m}***`);
  return (start>0?'…':'') + snip + (end<text.length?'…':'');
}

// 1) CORS
app.use(cors());
// 2) Static UI
app.use(express.static(PUBLIC_DIR));

// 3) Ricerca
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const srcFilter = req.query.source;
    // carica tutti i json
    const files = await fs.readdir(INDEX_DIR);
    let docs = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const data = JSON.parse(await fs.readFile(path.join(INDEX_DIR, f), 'utf8'));
      docs.push(data);
    }
    // filtri testo/fonte
    let results = docs.filter(d =>
      (!q || (d.text||'').toLowerCase().includes(q.toLowerCase())) &&
      (!srcFilter || srcFilter==='all' || d.source===srcFilter)
    );
    // aggiungi preview
    results = results.map(d => ({
      ...d,
      preview: makePreview(d.text, q)
    }));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'API error' });
  }
});

// 4) Catch-all per SPA
app.get('*', (req, res) =>
  res.sendFile(path.resolve(PUBLIC_DIR, 'index.html'))
);

// 5) Avvio
app.listen(PORT, () =>
  console.log(`🔗 API+UI server running at http://localhost:${PORT}`)
);
