import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup per __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorsi
const parsedDir = path.join(__dirname, '../parsed');
const indexedDir = path.join(__dirname, '../indexed');

// Crea cartella indexed/ se non esiste
await fs.mkdir(indexedDir, { recursive: true });

// Lista dei file .txt nella cartella parsed/
const files = await fs.readdir(parsedDir);

for (const file of files) {
  if (!file.endsWith('.txt')) continue;

  const filePath = path.join(parsedDir, file);
  const rawText = await fs.readFile(filePath, 'utf8');

  // 🔹 Pulizia avanzata del testo
  const cleaned = rawText
    .replace(/\s+/g, ' ')                 // spazi multipli
    .replace(/[\r\n\t]+/g, ' ')           // ritorni a capo e tabulazioni
    .replace(/(Header|Footer).{0,30}/gi, '') // rimuove header/footer se presenti
    .trim();

  // 🔹 Separazione logica per titoli
  const sections = cleaned.split(/(?=([A-Z][^\n]{5,80}:))/g)  // match tipo "Title:", "Section:", ecc.

  const chunks = [];
  for (let i = 0; i < sections.length; i += 2) {
    const title = sections[i]?.trim();
    const content = sections[i + 1]?.trim();
    if (title && content) {
      chunks.push({ title, content });
    }
  }

  // 🔹 Salva output indicizzato
  const id = file.replace('.txt', '');
  const outputPath = path.join(indexedDir, `${id}.json`);
  await fs.writeFile(outputPath, JSON.stringify(chunks, null, 2), 'utf8');

  console.log(`✅ Indicizzato ${file} → ${outputPath}`);
}

console.log('📚 Indicizzazione completata.');
