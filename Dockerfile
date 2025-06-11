# -------- Stage 1: BUILD -------------------------------------------------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run update-all     # genera indexed/ alla build

# -------- Stage 2: RUNTIME ----------------------------------------------
FROM node:18-alpine AS runtime
WORKDIR /app

# deps produzione
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

# codice + artefatti
COPY --from=build /app/ .

# utilità cron + dos2unix
RUN apk add --no-cache dumb-init busybox-suid dos2unix

# converte CRLF→LF per ogni .sh
RUN find /app -type f -name "*.sh" -exec dos2unix {} +

# cron
RUN chmod 0644 /etc/cron.d/varcavia && crontab /etc/cron.d/varcavia

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "/docker-entrypoint.sh"]
EXPOSE 3000
