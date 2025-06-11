import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const PARSED_DIR = 'parsed';
const INDEX_DIR  = 'indexed';

await fs.mkdir(INDEX_DIR, { recursive: true });

const documents = [];
const seenHash  = new Set();

for (const file of await fs.readdir(PARSED_DIR)) {
  if (!file.endsWith('.txt')) continue;

  const id   = file.replace('.txt', '');
  const text = await fs.readFile(path.join(PARSED_DIR, file), 'utf8');
  const hash = Buffer.from(text).toString('base64');     // semplice dedupe

  if (seenHash.has(hash)) {
    console.log(`⚠️  Duplicate skip: ${file}`);
    continue;
  }
  seenHash.add(hash);

  const [source, date = ''] = id.split('_');
  const title = text.split('\n')[0].slice(0, 100);

  documents.push({ id, source, date, title, text });
}

// crea indice lunr
const idx = lunr(function () {
  this.ref('id');
  this.field('title'); this.field('text'); this.field('source');
  documents.forEach(d => this.add(d));
});

await fs.writeFile(path.join(INDEX_DIR, 'index.json'),     JSON.stringify(idx));
await fs.writeFile(path.join(INDEX_DIR, 'documents.json'), JSON.stringify(Object.fromEntries(documents.map(d => [d.id, d])), null, 2));

console.log(`📚 Indicizzati ${documents.length} documenti unici.`);
