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

# Install dependencies
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# =========================================
# Stage 2: Builder (only for shared package)
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy shared source code
COPY shared ./shared

# Build shared package only
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# =========================================
# Stage 3: Development Runtime
# (Production build fails with onClick handlers for 60+ attempts)
# =========================================
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl

# Copy all dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy built shared package
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy frontend source code with ALL config files (not built)
COPY frontend/package.json frontend/tsconfig.json frontend/next.config.js ./frontend/
COPY frontend/tailwind.config.js frontend/postcss.config.js ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

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

# Run dev server (production build fails with event handler errors)
CMD ["sh", "-c", "corepack enable pnpm && pnpm run dev"]
