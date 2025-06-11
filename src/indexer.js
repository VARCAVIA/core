import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const PARSED_DIR = 'parsed';
const INDEX_DIR = 'indexed';

const documents = [];
const docMap = {};

const files = await fs.readdir(PARSED_DIR);

for (const file of files) {
  if (!file.endsWith('.txt')) continue;

  const id = file.replace('.txt', '');
  const text = await fs.readFile(path.join(PARSED_DIR, file), 'utf8');
  const source = id.split('_')[0];
  const date = id.split('_')[1] || '';
  const title = text.split('\n')[0].slice(0, 80);

  const doc = {
    id,
    source,
    date,
    title,
    text
  };

  documents.push(doc);
  docMap[id] = doc;
}

const idx = lunr(function () {
  this.ref('id');
  this.field('text');
  this.field('title');
  this.field('source');

  documents.forEach(d => this.add(d));
});

await fs.mkdir(INDEX_DIR, { recursive: true });
await fs.writeFile(path.join(INDEX_DIR, 'index.json'), JSON.stringify(idx));
await fs.writeFile(path.join(INDEX_DIR, 'documents.json'), JSON.stringify(docMap));

console.log(`📚 Indicizzazione full-text multi-campo completata con ${documents.length} documenti.`);
