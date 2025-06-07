import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorsi cartelle
const parsedDir = path.join(__dirname, '../parsed');
const indexedDir = path.join(__dirname, '../indexed');

// Assicura che la cartella indexed/ esista
await fs.mkdir(indexedDir, { recursive: true });

// Utility: pulizia base del testo
function cleanText(text) {
  return text
    .replace(/^\s+|\s+$/gm, '')                  // Rimuove spazi iniziali/finali
    .replace(/\n{2,}/g, '\n')                    // Rimuove righe vuote multiple
    .replace(/Pagina \d+/gi, '')                 // Rimuove numeri di pagina
    .replace(/^\s*Indice\s*$/gim, '')            // Rimuove "Indice"
    .replace(/\s{2,}/g, ' ')                     // Spazi doppi
    .trim();
}

// Utility: segmentazione in articoli/sezioni
function splitIntoSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let current = { title: '', content: '' };

  for (const line of lines) {
    const match = line.match(/^(Art\.?\s?\d+|[0-9]+\.)\s*(.+)/i);
    if (match) {
      if (current.title) sections.push(current);
      current = {
        title: match[1].trim(),
        content: match[2].trim()
      };
    } else {
      current.content += ' ' + line.trim();
    }
  }
  if (current.title) sections.push(current);
  return sections;
}

// Leggi i file txt da parsed/
const files = await fs.readdir(parsedDir);

for (const file of files) {
  if (!file.endsWith('.txt')) continue;

  const inputPath = path.join(parsedDir, file);
  const outputPath = path.join(indexedDir, file.replace('.txt', '.json'));

  try {
    const rawText = await fs.readFile(inputPath, 'utf8');
    const cleaned = cleanText(rawText);
    const sections = splitIntoSections(cleaned);

    await fs.writeFile(outputPath, JSON.stringify(sections, null, 2));
    console.log(`📚 Indicizzato ${file} → ${outputPath}`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}

console.log('🧠 Indicizzazione completata.');
