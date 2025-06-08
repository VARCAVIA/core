# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# 1) Copia package e installa
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 2) Copia tutto il resto
COPY . .

# 3) Espone la porta
EXPOSE 3000

# 4) Comando di avvio
CMD ["node", "src/api.js"]
