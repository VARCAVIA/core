@echo off
echo Avvio SCRAPER
node src\scraper.js

echo Avvio LOADER
node src\loader.js

echo Avvio INDEXER
node src\indexer.js

echo Update completato.
pause
