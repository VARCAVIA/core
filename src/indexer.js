import fs from 'fs/promises';
import path from 'path';
import lunr from 'lunr';

const parsedDir = 'parsed';
const indexedDir = 'indexed';

// Assicura cartella indexed/
await fs.mkdir(indexedDir, { recursive: true });

let files;
try {
  files = await fs.readdir(parsedDir);
} catch (err) {
  console.error('❌ Errore leggendo la cartella parsed/:', err.message);
  process.exit(1);
}

const documents = [];
let counter = 0;

for (const file of files) {
  if (!file.endsWith('.txt')) continue;
  const id = path.basename(file, '.txt');
  let text;
  try {
    text = await fs.readFile(path.join(parsedDir, file), 'utf8');
  } catch (err) {
    console.error(`❌ Errore leggendo ${file}: ${err.message}`);
    continue;
  }
  const doc = { id, text };
  documents.push(doc);
  try {
    await fs.writeFile(path.join(indexedDir, `${id}.json`), JSON.stringify(doc));
    console.log(`✅ Indicizzato ${file} → ${path.join(indexedDir, id + '.json')}`);
    counter++;
  } catch (err) {
    console.error(`❌ Errore scrivendo indice per ${file}: ${err.message}`);
  }
}

try {
  const idx = lunr(function () {
    this.ref('id');
    this.field('text');
    for (const doc of documents) this.add(doc);
  });
  await fs.writeFile(path.join(indexedDir, 'index.json'), JSON.stringify(idx));
  console.log(`📚 Indicizzazione completata con ${counter} documenti indicizzati.`);
} catch (err) {
  console.error('❌ Errore durante la creazione/salvataggio dell’indice:', err.message);
  process.exit(1);
}
