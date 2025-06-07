import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Setup per __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorsi
const indexedDir = path.join(__dirname, '../indexed');

// Carica tutti i file JSON
const files = await fs.readdir(indexedDir);
const documents = [];

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  const content = JSON.parse(await fs.readFile(path.join(indexedDir, file), 'utf8'));
  content.forEach((section, i) => {
    documents.push({
      id: `${file.replace('.json', '')}#${i}`,
      title: section.title,
      content: section.content,
      source: file.replace('.json', '')
    });
  });
}

// Costruisci l’indice Lunr
const idx = lunr(function () {
  this.ref('id');
  this.field('title');
  this.field('content');

  documents.forEach(doc => this.add(doc));
});

// Prompt CLI per ricerca
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔍 Inserisci una parola chiave: ', query => {
  const results = idx.search(query);
  console.log(`\n📌 Trovati ${results.length} risultati:\n`);

  results.slice(0, 10).forEach((res, i) => {
    const doc = documents.find(d => d.id === res.ref);
    console.log(`🔹 [${i + 1}] ${doc.source} → ${doc.title}`);
    console.log(`     → ${doc.content.slice(0, 150)}...`);
  });

  rl.close();
});
