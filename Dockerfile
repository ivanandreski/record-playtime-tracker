# Stage 1: production node_modules + generated prisma client
FROM node:26-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Stage 2: build
FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: runtime (no config or secrets baked in)
FROM node:26-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY prisma ./prisma
COPY prisma.config.ts package.json ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node build"]
