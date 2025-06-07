# VARCAVIA – Core MVP

Pipeline normativa europea automatizzata.

## Flusso pipeline

- **Estrazione** (scraper.js): scarica HTML dalle fonti configurate in `config/registry.yaml`
- **Parsing** (loader.js): estrae solo testo utile dai file HTML scaricati
- **Indicizzazione** (indexer.js): struttura e indicizza i testi per ricerca veloce
- **API** (api.js): espone ricerca keyword e anteprima via HTTP
- **Frontend demo**: minimale in `public/index.html` (cerca su localhost:3000)

## Setup rapido (in locale)

```bash
git clone https://github.com/VARCAVIA/core
cd core
npm install
node src/scraper.js
node src/loader.js
node src/indexer.js
node src/api.js
# poi vai su http://localhost:3000 e cerca!
