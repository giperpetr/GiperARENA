# ============================================
# ArenaHUB Backend API Dockerfile
# ============================================

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

# ============================================
# Build stage
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Build shared package first
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

# Build backend
WORKDIR /app/backend
RUN corepack enable pnpm && pnpm run build

# ============================================
# Production stage
# ============================================
FROM base AS runner

WORKDIR /app

# Install goose for migrations
RUN apk add --no-cache curl && \
    curl -fsSL https://raw.githubusercontent.com/pressly/goose/master/install.sh | sh

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Install production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/backend/package.json ./backend/

RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile

# Copy built files
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/migrations ./backend/migrations
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist

WORKDIR /app/backend

USER nodejs

EXPOSE 3000
EXPOSE 9090

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
