import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Caricamento indice
let index;
let documents = [];

async function loadIndex() {
  try {
    const indexData = JSON.parse(await fs.readFile('indexed/index.json', 'utf8'));
    index = lunr.Index.load(indexData);

    const docsData = JSON.parse(await fs.readFile('indexed/docs.json', 'utf8'));
    documents = docsData;
    console.log(`✅ Indice e documenti caricati (${documents.length})`);
  } catch (err) {
    console.error('❌ Errore caricando l’indice:', err.message);
    process.exit(1);
  }
}

// Endpoint ricerca
app.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Parametro "q" richiesto' });

  try {
    const results = index.search(q);
    const matches = results.map(r => {
      const doc = documents.find(d => d.id === r.ref);
      return { score: r.score, ...doc };
    });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Avvia server dopo caricamento indice
loadIndex().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API attiva su http://localhost:${PORT}`);
  });
});
