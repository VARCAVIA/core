import fs from 'fs/promises';
import path from 'path';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import yaml from 'yaml';

const RAW_DIR    = 'raw';
const PARSED_DIR = 'parsed';
const META_FILE  = 'parsed/metadata.json';
const REGISTRY   = 'config/registry.yaml';

/* 1️⃣  Carica registry per campo issuer ----------------------------------- */
const { sources } = yaml.parse(await fs.readFile(REGISTRY, 'utf8'));
const issuerMap = Object.fromEntries(sources.map(s => [s.id, s.name]));

/* 2️⃣  Assicura cartella parsed ------------------------------------------ */
await fs.mkdir(PARSED_DIR, { recursive: true });

/* 3️⃣  Metadata accumulato ------------------------------------------------ */
const metadata = {};

/* 4️⃣  Cicla file HTML+RSS già scaricati ---------------------------------- */
for (const file of await fs.readdir(RAW_DIR)) {
  if (!file.endsWith('.html') && !file.endsWith('.xml')) continue;

  const id   = file.replace('.html', '').replace('.xml', '');
  const html = await fs.readFile(path.join(RAW_DIR, file), 'utf8');
  const dom  = new JSDOM(html);
  let title  = '';
  let text   = '';

  /* ---- Estrazione titolo ---------------------------------------------- */
  const og   = dom.window.document.querySelector('meta[property="og:title"]');
  if (og?.content) title = og.content.trim();
  if (!title) title = dom.window.document.title.trim();
  if (!title) title = dom.window.document.querySelector('h1')?.textContent?.trim() || '';

  /* ---- Estrazione testo leggibile -------------------------------------- */
  try {
    const reader = new Readability(dom.window.document);
    text = reader.parse().textContent;
  } catch {
    text = dom.window.document.body.textContent || '';
  }

  /* ---- Data (regex AAAA-MM-GG) ----------------------------------------- */
  const dateMatch = text.match(/\b(20\d{2}|19\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  const date = dateMatch ? dateMatch[0] : '';

  /* ---- Salva file .txt -------------------------------------------------- */
  const plain = `${title}\n\n${text}`;
  await fs.writeFile(path.join(PARSED_DIR, `${id}.txt`), plain);

  /* ---- Aggiorna metadata ---------------------------------------------- */
  metadata[id] = {
    id,
    source : id.split('_')[0],
    issuer : issuerMap[id.split('_')[0]] || '',
    title,
    date
  };

  console.log(`✅ ${file} → /app/parsed/${id}.txt, metadati estratti`);
}

/* 5️⃣  Salva metadata globale ------------------------------------------- */
await fs.writeFile(META_FILE, JSON.stringify(metadata, null, 2));
console.log('📄 Loader completato (metadati estesi).');
