# --- Stage 1: build ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run update-all        # genera indexed/ alla build

# --- Stage 2: runtime + cron ---
FROM node:18-alpine AS runtime
WORKDIR /app

# dipendenze prod
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

# codice + artefatti
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/indexed ./indexed
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/config ./config

# cron files
RUN apk add --no-cache dumb-init busybox-suid
COPY cron.d/varcavia /etc/cron.d/varcavia
RUN chmod 0644 /etc/cron.d/varcavia && crontab /etc/cron.d/varcavia

# entrypoint  ➜ avvia cron & API
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
