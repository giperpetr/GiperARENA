# ============================================
# ArenaHUB Blockchain Service Dockerfile
# ============================================

FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY blockchain/package.json ./blockchain/

RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# ============================================
# Build stage
# ============================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/blockchain/node_modules ./blockchain/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY shared ./shared
COPY blockchain ./blockchain

# Build shared first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build blockchain service
WORKDIR /app/blockchain
RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/blockchain/service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/blockchain/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ../shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/blockchain/node_modules ./node_modules

USER nodejs

EXPOSE 3003

ENV NODE_ENV=production
ENV PORT=3003

CMD ["node", "dist/index.js"]
