#!/bin/sh
set -e

mkdir -p logs
timestamp=$(date +"%Y%m%d-%H%M%S")
logfile="logs/update-${timestamp}.log"

echo "▶️  Esecuzione update-all: ${timestamp}" | tee -a "$logfile"

npm run update-all 2>&1 | tee -a "$logfile"
STATUS=${PIPESTATUS:-$?}   # compatibile busybox

# fallisce se log contiene "❌"
if [ "$STATUS" -eq 0 ] && grep -q "❌" "$logfile"; then
  STATUS=1
fi

if [ "$STATUS" -eq 0 ]; then
  echo "✅ Pipeline OK" | tee -a "$logfile"
  [ -n "$PING_URL" ] && curl -fsS --retry 3 "$PING_URL" >/dev/null 2>&1 || true
else
  echo "❌ Pipeline FAILED" | tee -a "$logfile"
  [ -n "$PING_URL" ] && curl -fsS --retry 3 "$PING_URL/fail" >/dev/null 2>&1 || true
  node /app/scripts/email-alert.js "$timestamp" "$logfile" || true
  exit 1
fi

echo "✅ Completato. Log salvato in $logfile"
