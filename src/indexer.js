import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup dirname per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cartella parsed
const parsedDir = path.join(__dirname, '../parsed');
// Cartella output indicizzato
const indexedDir = path.join(__dirname, '../indexed');

// Crea cartella indexed se non esiste
await fs.mkdir(indexedDir, { recursive: true });

// Leggi tutti i file .txt
const files = await fs.readdir(parsedDir);

for (const file of files) {
  if (!file.endsWith('.txt')) continue;

  const inputPath = path.join(parsedDir, file);
  const outputPath = path.join(indexedDir, file.replace('.txt', '.json'));

  try {
    const text = await fs.readFile(inputPath, 'utf8');

    // Normalizzazione e suddivisione in paragrafi/righe
    const sections = text
      .split(/\n{2,}/) // separa per due o più newline
      .map(s => s.trim())
      .filter(Boolean);

    const structured = sections.map((section, i) => ({
      id: `${file}-${i + 1}`,
      file: file,
      section: i + 1,
      text: section,
    }));

    await fs.writeFile(outputPath, JSON.stringify(structured, null, 2), 'utf8');
    console.log(`✅ Indicizzato ${file} in ${outputPath}`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}

console.log('📚 Indicizzazione completata.');
