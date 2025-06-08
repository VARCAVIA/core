// src/loader.js
import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDir = path.join(__dirname, '../raw');
const parsedDir = path.join(__dirname, '../parsed');

await fs.mkdir(parsedDir, { recursive: true });

const files = await fs.readdir(rawDir);

for (const file of files) {
  if (!file.endsWith('.html')) continue;

  const htmlPath = path.join(rawDir, file);
  const textPath = path.join(parsedDir, file.replace('.html', '.txt'));

  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    const dom = new JSDOM(html, { url: "https://fake.base/" });
    // Applica Readability per pulizia superiore
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const cleanText = (article && article.textContent)
      ? article.textContent.trim()
      : dom.window.document.body.textContent.trim();

    await fs.writeFile(textPath, cleanText);
    console.log(`✅ ${file} → ${textPath}`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}

console.log('📄 Loader completato.');
