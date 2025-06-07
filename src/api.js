import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import lunr from 'lunr';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup per __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexedDir = path.join(__dirname, '../indexed');
const data = [];
const files = await fs.readdir(indexedDir);
for (const file of files) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const doc = JSON.parse(await fs.readFile(path.join(indexedDir, file), 'utf8'));
  data.push(doc);
}

const idxData = JSON.parse(await fs.readFile(path.join(indexedDir, 'index.json'), 'utf8'));
const idx = lunr.Index.load(idxData);

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

const app = express();
app.use(cors());

// Serve anche i file statici da public/
app.use(express.static(path.join(__dirname, '../public')));

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

app.listen(3000, () => {
  console.log('🚀 API pronta su http://localhost:3000/');
  console.log('🌐 Apri il browser su http://localhost:3000/');
});
