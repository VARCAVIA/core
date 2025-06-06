import fs from 'fs/promises';
import fetch from 'node-fetch';
import yaml from 'yaml';

// Carica registro fonti
const text = await fs.readFile('config/registry.yaml', 'utf8');
const { sources } = yaml.parse(text);

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
    console.log(`    salvato ${path}`);
  } catch (err) {
    status = 'fail';
    console.error(`    errore: ${err.message}`);
  }

  // Append sul CSV (crea se non esiste)
  const line = `${src.id},${now},${status},${httpStatus},raw/${src.id}.html\n`;
  await fs.appendFile('crawler_runs.csv', line);
}

console.log('✅ Crawler run completato');
