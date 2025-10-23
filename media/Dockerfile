# ============================================
# ArenaHUB WebRTC Media Server Dockerfile
# ============================================

FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY media/package.json ./media/

RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# ============================================
# Build stage
# ============================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/media/node_modules ./media/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY shared ./shared
COPY media ./media

# Build shared first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build media
WORKDIR /app/media
RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner

WORKDIR /app

# Install runtime dependencies for mediasoup
RUN apk add --no-cache python3 make g++

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/media/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/media/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ../shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/media/node_modules ./node_modules

USER nodejs

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "dist/index.js"]
