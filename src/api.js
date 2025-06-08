// src/api.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Carica indice e documenti
const INDEX = JSON.parse(await fs.readFile('indexed/index.json', 'utf8'));
const DOCS = {};
for (const file of await fs.readdir('indexed')) {
  if (file === 'index.json') continue;
  DOCS[path.basename(file, '.json')] = JSON.parse(
    await fs.readFile(path.join('indexed', file), 'utf8')
  );
}
const idx = lunr.Index.load(INDEX);

// Health-check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search API
app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  console.log({ ts: new Date().toISOString(), event: 'search', q });
  try {
    const results = idx.search(q);
    const out = results.map(({ ref }) => {
      const doc = DOCS[ref];
      return {
        id: ref,
        source: doc.source,
        title: doc.title,
        preview: doc.preview,
        hash: doc.hash,
        timestamp: doc.timestamp
      };
    });
    res.json(out);
  } catch (err) {
    console.error({ ts: new Date().toISOString(), event: 'error', error: err.message });
    res.status(500).json({ error: 'API error' });
  }
});

// Fallback alla UI
app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🔗 API server running on http://localhost:${PORT}`);
});
