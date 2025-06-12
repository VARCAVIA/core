import fs from "fs/promises";
import path from "path";

// Assicura che la cartella parsed/ esista
await fs.mkdir("parsed", { recursive: true });

// Leggi tutti i file nella cartella raw/
const files = await fs.readdir("raw");

// Filtra solo i file HTML
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const rawPath = path.join("raw", file);
  const parsedPath = path.join("parsed", file.replace(".html", ".md"));

  try {
    const content = await fs.readFile(rawPath, "utf8");

    // Conversione semplice: pulisci gli spazi e togli i tag HTML
    const clean = content
      .replace(/<[^>]*>/g, "") // Rimuove i tag HTML
      .replace(/\s+/g, " ") // Rimuove spazi ripetuti
      .trim(); // Rimuove spazi iniziali/finali

    await fs.writeFile(parsedPath, clean);
    console.log(`✅ parsed/${parsedPath} creato.`);
  } catch (err) {
    console.error(`❌ Errore su ${file}: ${err.message}`);
  }
}

console.log("📦 Parser completato.");
