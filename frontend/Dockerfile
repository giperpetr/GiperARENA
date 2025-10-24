# ============================================
# ArenaHUB Frontend Dockerfile (DEV MODE FOR PRODUCTION)
# ============================================

FROM node:20-alpine AS base

# Install dependencies
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
# Runtime stage (NO BUILD - RUN DEV SERVER)
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/shared/node_modules ./shared/node_modules

# Copy source code (NO BUILD)
COPY --chown=nextjs:nodejs shared ./shared
COPY --chown=nextjs:nodejs frontend ./frontend

# Build shared package
WORKDIR /app/shared
RUN corepack enable pnpm && pnpm run build

WORKDIR /app/frontend

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run Next.js dev server in production!!!
CMD ["sh", "-c", "corepack enable pnpm && pnpm run dev"]
