import fs from 'fs/promises';
import crypto from 'crypto';
import fetch from 'node-fetch';
import yaml from 'yaml';

const REGISTRY = 'config/registry.yaml';
const RAW_DIR = 'raw';
const HASH_DB = 'hashes.json';

// 1. carica registro fonti
const { sources } = yaml.parse(await fs.readFile(REGISTRY, 'utf8'));

// 2. carica db hash esistente (o vuoto)
let hashDb = {};
try { hashDb = JSON.parse(await fs.readFile(HASH_DB, 'utf8')); } catch {}

// 3. assicura cartella raw
await fs.mkdir(RAW_DIR, { recursive: true });

const now = new Date().toISOString();
for (const src of sources) {
  console.log(`--> ${src.id} (${src.url})`);
  let status = 'ok', http = 0;

  try {
    const res = await fetch(src.url);
    http = res.status;
    if (!res.ok) throw new Error(res.statusText);

    const body = await res.text();
    const hash = crypto.createHash('sha256').update(body).digest('hex');

    // deduplica
    if (hashDb[src.id] === hash) {
      console.log('    ⚠️  Contenuto invariato – skip.');
      continue;
    }

    const filename = `${RAW_DIR}/${src.id}.html`;
    await fs.writeFile(filename, body);
    hashDb[src.id] = hash;
    console.log(`    ✅ Salvato ${filename}`);
  } catch (err) {
    status = 'fail';
    console.error(`    ❌ ${err.message}`);
  }

  // append run
  await fs.appendFile(
    'crawler_runs.csv',
    `${src.id},${now},${status},${http}\n`
  );
}

// 4. salva nuovo db hash
await fs.writeFile(HASH_DB, JSON.stringify(hashDb, null, 2));
console.log('✅ Crawler completato (deduplicazione attiva).');
