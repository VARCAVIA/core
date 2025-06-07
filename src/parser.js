import fs from 'fs/promises';
import { JSDOM } from 'jsdom';

// Funzione per leggere e trasformare HTML in testo leggibile
async function parseHTMLtoText(filePath) {
  const htmlContent = await fs.readFile(filePath, 'utf8');
  const dom = new JSDOM(htmlContent);
  return dom.window.document.body.textContent.trim();
}

// Funzione principale del parser
async function runParser() {
  const rawDir = './raw';
  const parsedDir = './parsed';

  // Crea la cartella 'parsed' se non esiste
  await fs.mkdir(parsedDir, { recursive: true });

  // Leggi la lista dei file nella cartella 'raw'
  const files = await fs.readdir(rawDir);

  // Per ogni file HTML nella cartella 'raw'
  for (const file of files) {
    const text = await parseHTMLtoText(`${rawDir}/${file}`);

    // Salva il testo pulito in un nuovo file Markdown nella cartella 'parsed'
    const outputPath = `${parsedDir}/${file.replace('.html', '.md')}`;
    await fs.writeFile(outputPath, text);
    console.log(`✅ Creato file: ${outputPath}`);
  }

  console.log('🎉 Parser completato con successo!');
}

// Avvia il parser
runParser().catch(err => console.error('Errore durante il parsing:', err));
