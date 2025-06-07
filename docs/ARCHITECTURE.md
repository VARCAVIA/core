# VARCAVIA – ARCHITECTURE

## Pipeline overview

1. **scraper.js**  
   - Scarica fonti elencate in `config/registry.yaml`
   - Salva HTML/raw

2. **loader.js**  
   - Converte HTML/raw in testo pulito `.txt`
   - Output: `parsed/`

3. **indexer.js**  
   - Legge tutti i `.txt` da `parsed/`
   - Indicizza con Lunr.js e salva JSON in `indexed/`

4. **api.js**  
   - Espone ricerca full-text via API locali (Node.js + Express)
   - Usa `indexed/index.json` e dati per risposta preview

5. **public/index.html**  
   - Interfaccia minima per ricerca API

## Aggiornamento dati

- **Pipeline automatica:**  
  Esegui `update-all.bat` (Windows) o `update-all.sh` (Linux/Mac)
- Tutto avviene in locale, dati e ricerca sempre aggiornati.

## Struttura repo

- `src/`  → Tutto il codice (JS)
- `config/` → Fonti da monitorare
- `raw/`, `parsed/`, `indexed/` → Dati intermedi/finali (ignorabili su .gitignore)
- `public/` → Frontend demo
- `docs/` → Documentazione tecnica

---

## Roadmap (prossimi step suggeriti)

- [ ] Cleanup dati/UX: eliminazione rumore, titoli migliori, preview più smart
- [ ] Gestione errori/Log in scraping
- [ ] Interfaccia web migliorata (React/Vue o custom)
- [ ] Deploy su server/cloud
- [ ] Espansione fonti (altri paesi, feed JSON, API, ecc.)
- [ ] Sicurezza API e frontend

---

> **Contatto team: [tuo@email.com]**
