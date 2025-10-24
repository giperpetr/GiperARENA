# ============================================
# ArenaHUB Frontend Dockerfile (Next.js Standalone)
# ============================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 py3-pip make g++ linux-headers libusb-dev eudev-dev

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

# Copy package files for runner stage access
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

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

# Build frontend in standalone mode
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage (Standalone)
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js standalone server
CMD ["node", "frontend/server.js"]
