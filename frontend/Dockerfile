# ============================================
# ArenaHUB Frontend Dockerfile (Next.js 15)
# ============================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 py3-pip make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# ============================================
# Build stage
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY frontend ./frontend

# Build shared package first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
