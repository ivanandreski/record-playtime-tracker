# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client and build the SvelteKit app
RUN npx prisma generate
RUN npm run build

# Stage 2: runtime
FROM node:22-alpine AS runner
WORKDIR /app

COPY package*.json ./

# Copy all node_modules from builder (includes prisma CLI for migrations)
COPY --from=builder /app/node_modules ./node_modules

# Copy built SvelteKit app
COPY --from=builder /app/build ./build

# Copy Prisma schema and config (needed by `prisma migrate deploy`)
COPY prisma ./prisma
COPY prisma.config.ts ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node build"]
