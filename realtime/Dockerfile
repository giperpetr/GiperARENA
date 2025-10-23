# ============================================
# ArenaHUB Realtime WebSocket Server Dockerfile
# ============================================

FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY realtime/package.json ./realtime/

RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# ============================================
# Build stage
# ============================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/realtime/node_modules ./realtime/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

COPY shared ./shared
COPY realtime ./realtime

# Build shared first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build realtime
WORKDIR /app/realtime
RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/realtime/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/realtime/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ../shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/realtime/node_modules ./node_modules

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
