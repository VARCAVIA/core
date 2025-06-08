# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# 1) Copia package.json e installa dipendenze (incluse dev)
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copia tutto il progetto
COPY . .

# 3) Genera raw, parsed, indexed via update-all
RUN npm run update-all

# Runtime stage leggero
FROM node:18-alpine AS runtime
WORKDIR /app

# Copia solo i file necessari in produzione
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/indexed ./indexed

EXPOSE 3000
CMD ["node", "src/api.js"]
