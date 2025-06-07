import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup path support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assicura cartella di output
await fs.mkdir('parsed', { recursive: true });

// Leggi tutti i file nella cartella raw/
const rawDir = path.join(__dirname, '..', 'raw');
const files = await fs.readdir(rawDir);

for (const file of files) {
  if (!file.endsWith('.html')) continue;

  const rawPath = path.join(rawDir, file);
  const content = await fs.readFile(rawPath, 'utf8');

  const output = {
    source_id: file.replace('.html', ''),
    extracted_text: content.slice(0, 500), // per ora primi 500 caratteri
    metadata: {
      length: content.length,
      parsed_at: new Date().toISOString()
    }
  };

  const outputPath = path.join(__dirname, '..', 'parsed', file.replace('.html', '.json'));
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Salvato: ${outputPath}`);
}

console.log('✨ Parsing completato');
