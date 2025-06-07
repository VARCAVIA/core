// src/indexer.js
import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

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
  await fs.writeFile(path.join(indexedDir, `${id}.json`), JSON.stringify(doc));
  console.log(`✅ Indicizzato ${file} → ${path.join(indexedDir, id + '.json')}`);
  counter++;
}

const idx = lunr(function () {
  this.ref('id');
  this.field('text');
  for (const doc of documents) this.add(doc);
});

await fs.writeFile(path.join(indexedDir, 'index.json'), JSON.stringify(idx));
console.log(`📚 Indicizzazione completata con ${counter} documenti indicizzati.`);
