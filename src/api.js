import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Carica indice da disco
const INDEX_DIR = 'indexed';

let index;
let documents = {};

async function loadIndex() {
  const indexFile = path.join(INDEX_DIR, 'index.json');
  const docsFile = path.join(INDEX_DIR, 'documents.json');

  try {
    const idxData = await fs.readFile(indexFile, 'utf8');
    const docsData = await fs.readFile(docsFile, 'utf8');
    index = lunr.Index.load(JSON.parse(idxData));
    documents = JSON.parse(docsData);
    console.log('✅ Indice caricato con successo');
  } catch (err) {
    console.error('❌ Errore caricando l’indice:', err.message);
    process.exit(1);
  }
}

// Endpoint di test
app.get('/', (req, res) => {
  res.send('🔍 VARCAVIA Search API online');
});

// Endpoint di ricerca
app.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Parametro ?q mancante' });

  const results = index.search(q);
  const enriched = results.map(r => ({
    ref: r.ref,
    score: r.score,
    ...documents[r.ref]
  }));

  res.json({ query: q, results: enriched });
});

loadIndex().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API disponibile su http://localhost:${PORT}`);
  });
});
