import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';
import { fileURLToPath } from 'url';

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica documenti indicizzati
const dataPath = path.join(__dirname, '../indexed/index.json');
const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));

// Ricostruisci indice Lunr
const index = lunr(function () {
  this.ref('id');
  this.field('text');
  data.forEach(doc => this.add(doc));
});

const app = express();
const PORT = 3000;

app.get('/search', (req, res) => {
  const q = req.query.q || '';
  const results = index.search(q);
  const enriched = results.map(r => {
    const match = data.find(d => d.id === r.ref);
    return { id: match.id, preview: match.text.slice(0, 300) };
  });
  res.json(enriched);
});

app.get('/doc/:id', async (req, res) => {
  const doc = data.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});
