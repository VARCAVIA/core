#!/bin/sh
set -e

# Avvia cron in background
crond

# Avvia l’API
exec node src/api.js
