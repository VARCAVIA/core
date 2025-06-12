import fs from "fs/promises";
import path from "path";
import lunr from "lunr";
import yaml from "yaml";

const PARSED_DIR = "parsed";
const META_FILE = "parsed/metadata.json";
const INDEX_DIR = "indexed";
const REGISTRY = "config/registry.yaml";

/* 1️⃣  Carica registry per issuer fallback -------------------------------- */
const { sources } = yaml.parse(await fs.readFile(REGISTRY, "utf8"));
const issuerMap = Object.fromEntries(sources.map((s) => [s.id, s.name]));

/* 2️⃣  Carica metadata generato dal loader -------------------------------- */
let meta = {};
try {
  meta = JSON.parse(await fs.readFile(META_FILE, "utf8"));
} catch {}

/* 3️⃣  Costruzione documenti + dedup ------------------------------------- */
await fs.mkdir(INDEX_DIR, { recursive: true });
const documents = [];
const seenHash = new Set();

for (const file of await fs.readdir(PARSED_DIR)) {
  if (!file.endsWith(".txt")) continue;

  const id = file.replace(".txt", "");
  const text = await fs.readFile(path.join(PARSED_DIR, file), "utf8");
  const hash = Buffer.from(text).toString("base64");
  if (seenHash.has(hash)) continue;
  seenHash.add(hash);

  const [source] = id.split("_");
  const title = meta[id]?.title || text.split("\n")[0].slice(0, 100);
  const date = meta[id]?.date || "";
  const issuer = meta[id]?.issuer || issuerMap[source] || "";

  documents.push({ id, source, date, issuer, title, text });
}

/* 4️⃣  Indicizzazione lunr ---------------------------------------------- */
const idx = lunr(function () {
  this.ref("id");
  this.field("title");
  this.field("text");
  this.field("source");
  this.field("issuer");
  this.field("date");
  documents.forEach((d) => this.add(d));
});

/* 5️⃣  Salva artefatti --------------------------------------------------- */
await fs.writeFile(path.join(INDEX_DIR, "index.json"), JSON.stringify(idx));
await fs.writeFile(
  path.join(INDEX_DIR, "documents.json"),
  JSON.stringify(Object.fromEntries(documents.map((d) => [d.id, d])), null, 2),
);

console.log(
  `📚 Indicizzati ${documents.length} documenti con metadati avanzati.`,
);
