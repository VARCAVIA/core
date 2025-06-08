// src/loader.js
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import yaml from 'yaml';

const rawDir = 'raw';
const parsedDir = 'parsed';

// Carica la lista fonti per ottenere i nomi
const sources = yaml.parse(await fs.readFile('config/registry.yaml', 'utf8')).sources;

await fs.mkdir(parsedDir, { recursive: true });

const files = await fs.readdir(rawDir);

for (const file of files) {
  if (!file.endsWith('.html')) continue;
  const id = path.basename(file, '.html');
  const html = await fs.readFile(path.join(rawDir, file), 'utf8');

  // Estrazione via Readability
  const dom = new JSDOM(html);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  // Recupera title e testo principale
  const title = article?.title || '';
  const text = article?.textContent || '';

  // Data di scraping come fallback (migliorabile in seguito con pattern sul testo)
  const date = new Date().toISOString();

  // Info fonte
  const sourceObj = sources.find(s => s.id === id);
  const source = sourceObj ? sourceObj.name : id;

  // Salva JSON con metadati
  const parsedObj = {
    id,
    title,
    date,
    source,
    text
  };
  await fs.writeFile(path.join(parsedDir, `${id}.txt`), text);
  await fs.writeFile(path.join(parsedDir, `${id}.json`), JSON.stringify(parsedObj, null, 2));

  console.log(`✅ ${file} → ${path.resolve(parsedDir, id + '.txt')}, metadati estratti`);
}
console.log('📄 Loader completato (metadati inclusi).');
