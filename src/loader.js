import fs from 'fs/promises';
import { JSDOM } from 'jsdom';

// Assicura esistenza cartella parsed/
await fs.mkdir('parsed', { recursive: true });

// Leggi tutti i file presenti nella cartella raw/
const files = await fs.readdir('raw');

for (const file of files) {
  const rawPath = `raw/${file}`;
  const parsedPath = `parsed/${file.replace('.html', '.txt')}`;

  try {
    const html = await fs.readFile(rawPath, 'utf8');
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent || '';
    const cleaned = text.replace(/\s+/g, ' ').trim(); // normalizza spazi

    await fs.writeFile(parsedPath, cleaned);
    console.log(`✅ Parsed: ${parsedPath}`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}
