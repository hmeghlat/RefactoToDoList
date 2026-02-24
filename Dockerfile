# Étape 1 — Build : on compile le TypeScript en JavaScript
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Build du frontend Vite
RUN cd src/frontend && npm ci && npm run build
# Vite génère dans dist-frontend (outDir: ../../dist-frontend depuis src/frontend)
RUN cp -r dist-frontend dist/static

# Étape 2 — Production : on ne garde que le nécessaire pour faire tourner l'app
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
