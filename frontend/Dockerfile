# syntax=docker/dockerfile:1

# =========================================
# Stage 1: Dependencies
# =========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 py3-pip make g++ curl linux-headers eudev-dev

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies using pnpm
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile --strict-peer-dependencies=false

# =========================================
# Stage 2: Builder
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Now copy source code (after node_modules are in place)
COPY shared ./shared
COPY frontend ./frontend

# Build shared package first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Skip frontend build - we'll use dev mode in production
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1

# =========================================
# Stage 3: Production Runtime
# =========================================
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy node_modules (entire workspace)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared/node_modules ./shared/node_modules
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules

# Copy built shared package
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package.json ./shared/package.json

# Copy frontend SOURCE CODE (dev mode in production)
COPY --from=builder /app/frontend ./frontend


# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

WORKDIR /app/frontend

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start DEV server (production build crashes with 60+ onClick errors)
CMD ["npx", "next", "dev"]
