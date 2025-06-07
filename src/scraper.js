import fs from 'fs/promises';
import fetch from 'node-fetch';
import yaml from 'yaml';

// Carica registro fonti
let sources;
try {
  const text = await fs.readFile('config/registry.yaml', 'utf8');
  ({ sources } = yaml.parse(text));
  if (!sources) throw new Error('No sources found in registry.yaml');
} catch (err) {
  console.error('❌ Errore caricando registry.yaml:', err.message);
  process.exit(1);
}

// Assicura esistenza cartella raw/
await fs.mkdir('raw', { recursive: true });

// Timestamp ISO compatto
const now = new Date().toISOString();

// Cicla su ogni fonte
for (const src of sources) {
  console.log(`--> ${src.id}  (${src.url})`);
  let status = 'ok';
  let httpStatus = 0;
  try {
    const res = await fetch(src.url);
    httpStatus = res.status;
    if (!res.ok) throw new Error(res.statusText);
    const body = await res.text();
    const path = `raw/${src.id}.html`;
    await fs.writeFile(path, body);
    console.log(`    ✅ Salvato ${path}`);
  } catch (err) {
    status = 'fail';
    console.error(`    ❌ Errore su ${src.id}: ${err.message}`);
  }

  // Append sul CSV (crea se non esiste)
  const line = `${src.id},${now},${status},${httpStatus},raw/${src.id}.html\n`;
  await fs.appendFile('crawler_runs.csv', line);
}

console.log('✅ Crawler run completato');
