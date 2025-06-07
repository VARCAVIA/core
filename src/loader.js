import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Setup per __dirname su ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cartelle
const rawDir = path.join(__dirname, '../raw');
const parsedDir = path.join(__dirname, '../parsed');

// Assicura cartella parsed/
await fs.mkdir(parsedDir, { recursive: true });

// Lista file HTML
const files = await fs.readdir(rawDir);

for (const file of files) {
  if (!file.endsWith('.html')) continue;

  const htmlPath = path.join(rawDir, file);
  const textPath = path.join(parsedDir, file.replace('.html', '.txt'));

  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent.trim();

    await fs.writeFile(textPath, text);
    console.log(`✅ ${file} → ${textPath}`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}

console.log('📄 Loader completato.');
