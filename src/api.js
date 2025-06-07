import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import lunr from 'lunr';
import path from 'path';

const app = express();
app.use(cors());

const DATA_PATH = 'indexed';
const INDEX_FILE = path.join(DATA_PATH, 'index.json');

function cleanText(text) {
  // Rimuove simboli ripetuti, spazi, header/footer rumorosi (grezzo, migliorabile)
  return text
    .replace(/\*\*\*/g, '')    // Rimuove ***
    .replace(/\r?\n|\r/g, ' ') // Rende tutto una riga
    .replace(/\s+/g, ' ')      // Spazi multipli
    .trim();
}

function makePreview(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return cleanText(text).slice(0, 180) + "...";
  // Estrae 80 caratteri prima e 80 dopo la parola trovata
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = cleanText(text.slice(start, end));
  // Evidenzia la parola chiave con ***
  snippet = snippet.replace(
    new RegExp(keyword, 'gi'),
    match => `***${match}***`
  );
  return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
}

let idx;
let docs = [];

async function loadData() {
  // Carica tutti i .json singoli, ignora index.json
  const files = (await fs.readdir(DATA_PATH)).filter(f => f.endsWith('.json') && f !== 'index.json');
  docs = [];
  for (const file of files) {
    const d = JSON.parse(await fs.readFile(path.join(DATA_PATH, file), 'utf8'));
    docs.push({
      id: d.id,
      text: cleanText(d.text),
      // Estrai titolo dalle prime 120 lettere (migliorabile)
      title: cleanText(d.text).slice(0, 120) + "...",
      source: d.id
    });
  }
  // Carica l'indice (serializzato con lunr)
  const rawIdx = JSON.parse(await fs.readFile(INDEX_FILE, 'utf8'));
  idx = lunr.Index.load(rawIdx);
}

await loadData();

app.get('/search', (req, res) => {
  const query = (req.query.q || '').toString().trim();
  if (!query) return res.json([]);
  const results = idx.search(query);
  res.json(results.map(({ ref }) => {
    const doc = docs.find(d => d.id === ref);
    return {
      id: doc.id,
      title: doc.title,
      source: doc.source,
      preview: makePreview(doc.text, query)
    };
  }));
});

app.listen(3000, () => {
  console.log('✅ API avviata su http://localhost:3000');
});
