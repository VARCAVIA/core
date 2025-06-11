#!/bin/sh
set -e

mkdir -p logs
timestamp=$(date +"%Y%m%d-%H%M%S")
logfile="logs/update-${timestamp}.log"

echo "▶️  Esecuzione update-all: ${timestamp}" | tee -a "$logfile"

if npm run update-all 2>&1 | tee -a "$logfile"; then
  [ -n "$PING_URL" ] && curl -fsS --retry 3 "$PING_URL"         >/dev/null 2>&1 || true
else
  [ -n "$PING_URL" ] && curl -fsS --retry 3 "$PING_URL/fail"    >/dev/null 2>&1 || true
  node /app/scripts/email-alert.js "$timestamp" "$logfile" || true
  exit 1
fi

echo "✅ Completato. Log salvato in $logfile"
