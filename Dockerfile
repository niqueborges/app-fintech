# Estagio 1: Build do Frontend (React + Vite)
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Estagio 2: Build do Backend (NestJS + Prisma)
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Estagio 3: Imagem Final de Producao
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY --from=backend-builder /app/src/generated ./src/generated
COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
