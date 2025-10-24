# syntax=docker/dockerfile:1

# =========================================
# Stage 1: Dependencies
# =========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 py3-pip make g++ curl

WORKDIR /app

# Copy workspace files  
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# =========================================
# Stage 2: Builder
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY shared ./shared
COPY frontend ./frontend

# Build shared package
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build frontend
WORKDIR /app/frontend

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm run build

# =========================================
# Stage 3: Production Runtime (Node.js)
# =========================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl

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

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "frontend/server.js"]
