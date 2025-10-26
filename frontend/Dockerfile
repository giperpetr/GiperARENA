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

# Build frontend (PRODUCTION BUILD with Next.js 15 + React 19)
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN corepack enable pnpm && pnpm run build

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

# Copy built frontend (.next folder + public + next.config.js)
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.js ./frontend/next.config.js
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/frontend/tsconfig.json ./frontend/tsconfig.json

# For dev mode, we also need the source code
COPY --from=builder /app/frontend/src ./frontend/src

# Create proper tsconfig.json for dev mode with path aliases
RUN cat > ./frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "ES2022"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@shared/*": [
        "../shared/src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOF

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

# Start dev server in production (fixes onClick handler errors)
# Create proper tsconfig.json in a different location and copy it to prevent Next.js from overwriting
CMD ["sh", "-c", "cat > /tmp/tsconfig.json << 'EOF'\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"lib\": [\n      \"dom\",\n      \"dom.iterable\",\n      \"ES2022\"\n    ],\n    \"allowJs\": true,\n    \"skipLibCheck\": true,\n    \"strict\": true,\n    \"noEmit\": true,\n    \"esModuleInterop\": true,\n    \"module\": \"esnext\",\n    \"moduleResolution\": \"bundler\",\n    \"resolveJsonModule\": true,\n    \"isolatedModules\": true,\n    \"jsx\": \"preserve\",\n    \"incremental\": true,\n    \"plugins\": [\n      {\n        \"name\": \"next\"\n      }\n    ],\n    \"paths\": {\n      \"@/*\": [\n        \"./src/*\"\n      ],\n      \"@shared/*\": [\n        \"../shared/src/*\"\n      ]\n    }\n  },\n  \"include\": [\n    \"next-env.d.ts\",\n    \"**/*.ts\",\n    \"**/*.tsx\",\n    \".next/types/**/*.ts\",\n    \".next/dev/types/**/*.ts\"\n  ],\n  \"exclude\": [\n    \"node_modules\"\n  ]\n}\nEOF\ncp /tmp/tsconfig.json tsconfig.json && npx next dev"]
