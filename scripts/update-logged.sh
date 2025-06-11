#!/bin/sh
set -e

mkdir -p logs
timestamp=$(date +"%Y%m%d-%H%M%S")
logfile="logs/update-${timestamp}.log"

echo "▶️  Esecuzione update-all: ${timestamp}" | tee -a "$logfile"
npm run update-all 2>&1 | tee -a "$logfile"
echo "✅ Completato. Log salvato in $logfile"
