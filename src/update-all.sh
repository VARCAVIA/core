#!/bin/bash
# Esegue l’intera pipeline dati

echo ">>> Avvio SCRAPER"
node src/scraper.js

echo ">>> Avvio LOADER"
node src/loader.js

echo ">>> Avvio INDEXER"
node src/indexer.js

echo ">>> Update completato."
