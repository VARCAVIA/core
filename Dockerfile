# Dockerfile

# --- Stage 1: Build ---
# Installa dipendenze, copia il codice e genera gli indici statici
FROM node:18-alpine AS build
WORKDIR /app

# Copia package.json e installa TUTTE le dipendenze (incluse dev-dependencies per la build)
COPY package.json package-lock.json ./
RUN npm ci

# Copia il resto del codice sorgente
COPY . .

# Esegui lo script che genera gli indici (risolve l'errore ENOENT)
RUN npm run update-all

# --- Stage 2: Runtime ---
# Prepara l'immagine finale, leggera e pronta per la produzione
FROM node:18-alpine AS runtime
WORKDIR /app

# Copia solo le dipendenze di produzione dallo stage di build
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

# Copia solo gli artefatti necessari per l'esecuzione
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/indexed ./indexed

EXPOSE 3000
CMD ["node", "src/api.js"]
