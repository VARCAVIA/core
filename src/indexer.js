// src/indexer.js
import fs from 'fs/promises';
import path from 'path';

const parsedDir = 'parsed';
const indexedDir = 'indexed';

await fs.mkdir(indexedDir, { recursive: true });

const files = await fs.readdir(parsedDir);
const documents = [];
let counter = 0;

for (const file of files) {
  if (!file.endsWith('.txt')) continue;
  const id = path.basename(file, '.txt');
  const text = await fs.readFile(path.join(parsedDir, file), 'utf8');
  const doc = { id, text };
  documents.push(doc);
  await fs.writeFile(path.join(indexedDir, `${id}.json`), JSON.stringify(doc, null, 2));
  console.log(`✅ Indicizzato ${file} → ${path.join(indexedDir, id + '.json')}`);
  counter++;
}

// **Qui la modifica:**
// Salva TUTTI i documenti come ARRAY in index.json
await fs.writeFile(path.join(indexedDir, 'index.json'), JSON.stringify(documents, null, 2));

console.log(`📚 Indicizzazione completata con ${counter} documenti indicizzati.`);
