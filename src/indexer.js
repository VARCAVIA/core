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
  if (!file.endsWith('.json')) continue; // Ora usa i file JSON con metadati
  const doc = JSON.parse(await fs.readFile(path.join(parsedDir, file), 'utf8'));
  // id, title, date, source, text già nel JSON
  documents.push(doc);
  await fs.writeFile(path.join(indexedDir, `${doc.id}.json`), JSON.stringify(doc));
  console.log(`✅ Indicizzato ${file} → ${path.join(indexedDir, doc.id + '.json')}`);
  counter++;
}

// Indicizzazione multi-campo
const idx = lunr(function () {
  this.ref('id');
  this.field('title');
  this.field('text');
  this.field('source');
  this.field('date');
  for (const doc of documents) this.add(doc);
});

await fs.writeFile(path.join(indexedDir, 'index.json'), JSON.stringify(idx));
console.log(`📚 Indicizzazione full-text multi-campo completata con ${counter} documenti.`);
