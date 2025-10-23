# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ArenaHUB** is a revolutionary remote-controlled gaming platform that connects physical arenas with robotic devices (robots, drones, crawler machines) to online players worldwide. Users can control real devices in real-time, compete in tournaments, place bets, and earn cryptocurrency.

## 🗂️ Server Directory Structure

### **CRITICAL: Real Server Layout**

This project is deployed on a remote server with the following structure:

```
/root/
├── server/                          # Existing infrastructure (DO NOT MODIFY)
│   ├── supabase/                    # Supabase stack
│   │   ├── docker-compose.yml       # PostgreSQL, Redis, MinIO, n8n, Neo4j
│   │   ├── .env                     # Supabase secrets
│   │   └── volumes/                 # Data persistence
│   │       ├── db/                  # PostgreSQL data
│   │       ├── storage/             # MinIO data
│   │       └── ...
│   ├── monitoring/                  # Monitoring stack
│   │   ├── docker-compose.yml       # Prometheus, Grafana, Loki
│   │   ├── .env
│   │   └── volumes/
│   │       ├── prometheus/
│   │       ├── grafana/
│   │       └── loki/
│   └── proxy/                       # Traefik (assumed location)
│       └── docker-compose.yml
│
└── arenahub/                        # THIS PROJECT (NEW)
    ├── docker-compose.yml           # ArenaHUB services
    ├── .env                         # ArenaHUB environment variables
    ├── .env.example                 # Environment template
    ├── CLAUDE.md                    # This file
    ├── PRD.md                       # Product requirements
    ├── DEPLOYMENT.md                # Deployment guide
    ├── README.md                    # Project documentation
    │
    ├── frontend/                    # Next.js 15 application
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── next.config.js
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── app/                 # Next.js 15 App Router
    │   │   ├── components/          # React components
    │   │   ├── lib/                 # Utilities
    │   │   └── types/               # TypeScript types
    │   └── public/                  # Static assets
    │
    ├── backend/                     # Node.js API server
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts             # Entry point
    │   │   ├── config/              # Configuration
    │   │   ├── routes/              # API routes
    │   │   ├── controllers/         # Request handlers
    │   │   ├── services/            # Business logic
    │   │   ├── models/              # Database models
    │   │   ├── middleware/          # Express middleware
    │   │   ├── utils/               # Utilities
    │   │   └── types/               # TypeScript types
    │   ├── migrations/              # Database migrations
    │   └── tests/                   # Test files
    │
    ├── realtime/                    # Socket.io WebSocket server
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts             # Socket.io server
    │       ├── handlers/            # Socket event handlers
    │       ├── services/            # Game session management
    │       └── types/
    │
    ├── media/                       # WebRTC media server (mediasoup)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts             # mediasoup server
    │       ├── router.ts            # WebRTC routing
    │       ├── peer.ts              # Peer management
    │       └── recorder.ts          # Recording to MinIO
    │
    ├── blockchain/                  # Solana smart contracts & service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── Anchor.toml
    │   ├── programs/                # Rust smart contracts
    │   │   ├── gac-token/           # GAC governance token
    │   │   ├── pac-token/           # PAC utility token
    │   │   ├── escrow/              # Game fee escrow
    │   │   ├── staking/             # GAC staking
    │   │   ├── nft/                 # NFT marketplace
    │   │   ├── dao/                 # DAO governance
    │   │   └── betting/             # Betting system
    │   ├── tests/                   # Anchor tests
    │   └── service/                 # Node.js blockchain service
    │       └── src/
    │           ├── index.ts
    │           └── listeners/       # Blockchain event listeners
    │
    ├── shared/                      # Shared types & utilities
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── types/               # Shared TypeScript types
    │       ├── constants/           # Shared constants
    │       └── utils/               # Shared utilities
    │
    ├── scripts/                     # Deployment & maintenance scripts
    │   ├── deploy.sh                # Deploy to server
    │   ├── migrate.sh               # Run migrations
    │   ├── backup.sh                # Backup databases
    │   └── setup-tenant.sh          # Setup Supavisor tenant
    │
    ├── monitoring/                  # ArenaHUB-specific monitoring
    │   ├── grafana-dashboards/      # Grafana JSON dashboards
    │   ├── prometheus-rules/        # Alerting rules
    │   └── loki-labels/             # Log parsing configs
    │
    ├── n8n-workflows/               # n8n automation workflows
    │   ├── email-notifications.json
    │   ├── tournament-reminders.json
    │   └── payment-processing.json
    │
    ├── docs/                        # Additional documentation
    │   ├── api/                     # API documentation
    │   ├── architecture/            # Architecture diagrams
    │   └── guides/                  # User/developer guides
    │
    └── .taskmaster/                 # Task Master project management
        ├── tasks/
        ├── docs/
        └── config.json
```

### **Important Path Conventions**

1. **Docker Compose Paths:**
   - All `docker-compose.yml` files use **relative paths from their location**
   - ArenaHUB: `/root/arenahub/docker-compose.yml`
   - Supabase: `/root/server/supabase/docker-compose.yml`
   - Monitoring: `/root/server/monitoring/docker-compose.yml`

2. **Network Access:**
   ```yaml
   # ArenaHUB services connect to existing networks:
   networks:
     - default                    # Internal ArenaHUB network
     - proxy                      # External Traefik network
     - supabase_default           # Access to Supabase services
     - monitoring_default         # Send metrics to Prometheus
   ```

3. **Service References:**
   ```bash
   # From ArenaHUB services, reference existing services by container name:
   POSTGRES_HOST=supavisor        # Supabase pooler
   REDIS_HOST=queue-redis         # Redis from Supabase stack
   S3_ENDPOINT=http://minio:9000  # MinIO from Supabase stack
   ```

4. **Volume Mounts:**
   ```yaml
   # Development: Mount source code for hot reload
   volumes:
     - ./backend:/app
     - /app/node_modules

   # Production: Copy code into image (no volumes)
   # Defined in Dockerfile
   ```

### **Development vs Production**

**Local Development (on your machine):**
```
/Users/giperpetr/Documents/Programming/ArenaHUB/  # This directory
├── docker-compose.yml          # Uses existing Supabase if available
├── docker-compose.dev.yml      # Local overrides (volumes, hot reload)
└── .env.local                  # Local environment variables
```

**Production Server:**
```
/root/arenahub/                 # Deployed from Git
├── docker-compose.yml          # Production configuration
└── .env                        # Production secrets
```

### **Deployment Workflow**

1. **Develop locally** in this directory
2. **Commit to Git** (repository)
3. **SSH to server:** `ssh root@your-server.com`
4. **Navigate:** `cd /root/arenahub`
5. **Pull updates:** `git pull origin main`
6. **Rebuild:** `docker compose build`
7. **Deploy:** `docker compose up -d`

### **NEVER MODIFY:**
- `/root/server/supabase/` - Existing Supabase stack
- `/root/server/monitoring/` - Existing monitoring stack
- `/root/server/proxy/` - Traefik configuration

### **ALWAYS WORK IN:**
- `/root/arenahub/` - This project only

### Key Technologies

- **Frontend**: Next.js 15+, React 19+, TypeScript, Tailwind CSS 4+, shadcn/ui
- **State Management**: Zustand + React Query
- **Backend**: Node.js, Express/Fastify, PostgreSQL 17 (Supabase)
- **Real-time**: WebRTC, Socket.io, Supabase Realtime
- **Blockchain**: Solana, Anchor Framework, Web3.js
- **Storage**: MinIO S3, Supabase Storage
- **Cache**: Redis
- **Automation**: n8n
- **Monitoring**: Prometheus, Grafana, Loki, Sentry

### Project Structure

```
ArenaHUB/
├── .claude-collective/      # Claude Code collective agent system
├── .taskmaster/             # Task Master AI project management
├── .specify/                # Specify workflow templates
├── frontend/                # Next.js web application (to be created)
├── backend/                 # Node.js API server (to be created)
├── blockchain/              # Solana smart contracts (to be created)
├── arena-control/           # Raspberry Pi control software (to be created)
├── shared/                  # Shared types and utilities (to be created)
└── docs/                    # Documentation (to be created)
```

## Development Workflow

### Task Master Integration

This project uses Task Master AI for project management. Key commands:

```bash
# View all tasks
task-master list

# Get next task to work on
task-master next

# View task details
task-master show <id>

# Update task status
task-master set-status --id=<id> --status=done

# Add implementation notes
task-master update-subtask --id=<id> --prompt="notes"
```

### Database Setup

**CRITICAL: We use Goose for database migrations!**

All database migrations are managed with **[Goose](https://github.com/pressly/goose)** directly from this repository.

#### Goose Migration Workflow

```bash
# Install Goose (if not installed)
go install github.com/pressly/goose/v3/cmd/goose@latest

# Or use docker
docker run --rm -v "$PWD/backend/migrations:/migrations" \
  --network host \
  ghcr.io/pressly/goose:latest [command]

# Create new migration
cd backend
goose -dir migrations create add_users_table sql

# Run migrations
goose -dir migrations postgres "postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:5432/${POSTGRES_DB}?sslmode=disable" up

# Check status
goose -dir migrations postgres "..." status

# Rollback last migration
goose -dir migrations postgres "..." down

# Reset database (careful!)
goose -dir migrations postgres "..." reset
```

#### Migration Files Location

```
backend/migrations/
├── 00001_create_schema.sql
├── 00002_create_users_table.sql
├── 00003_create_arenas_table.sql
├── 00004_create_game_sessions_table.sql
├── 00005_create_tournaments_table.sql
├── 00006_create_bets_table.sql
├── 00007_create_nfts_table.sql
├── 00008_create_wallets_table.sql
└── 00009_create_transactions_table.sql
```

#### Migration File Format

```sql
-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON arenahub.users(username);
CREATE INDEX idx_users_email ON arenahub.users(email);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS arenahub.users CASCADE;
-- +goose StatementEnd
```

#### Important Rules

1. **NEVER edit existing migrations** - Always create new ones
2. **Use transactions** - Wrap DDL in `-- +goose StatementBegin/End`
3. **Always provide Down migrations** - For rollback capability
4. **Use arenahub schema** - All tables in `arenahub` schema, not `public`
5. **Test locally first** - Run on dev before production
6. **Sequential numbering** - Goose uses timestamp, but we use sequential for clarity

#### Database Connection String

```bash
# Via Supavisor (recommended for app)
postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:5432/${POSTGRES_DB}

# Direct to database (for migrations/DDL)
postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/${POSTGRES_DB}

# Transaction mode (for complex migrations)
postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:6543/${POSTGRES_DB}
```

#### npm scripts for migrations

```json
{
  "scripts": {
    "migrate:create": "goose -dir migrations create",
    "migrate:up": "goose -dir migrations postgres \"$DATABASE_URL\" up",
    "migrate:down": "goose -dir migrations postgres \"$DATABASE_URL\" down",
    "migrate:status": "goose -dir migrations postgres \"$DATABASE_URL\" status",
    "migrate:reset": "goose -dir migrations postgres \"$DATABASE_URL\" reset"
  }
}
```

Key tables (from PRD.md):
- `users` - User accounts and profiles
- `arenas` - Physical arena locations
- `game_sessions` - Active game sessions
- `tournaments` - Tournament events
- `bets` - Betting markets and bets
- `nfts` - NFT tokens
- `wallets` - User token balances
- `transactions` - All financial transactions

### API Development

Base URL: `https://api.arenahub.space/v1`

Key API modules:
- `/auth/*` - Authentication (Supabase Auth + Wallet)
- `/users/*` - User profiles and stats
- `/arenas/*` - Arena management
- `/sessions/*` - Game sessions
- `/tournaments/*` - Tournament system
- `/betting/*` - Betting markets
- `/nfts/*` - NFT marketplace
- `/wallet/*` - Token management

### Smart Contracts (Solana)

Contracts to implement:
1. **Token Contracts**: GAC (governance) and PAC (utility)
2. **Escrow Contract**: Game fee deposits and payouts
3. **Staking Contract**: GAC staking with tier system
4. **NFT Contract**: Device and achievement NFTs
5. **DAO Governance**: Voting system
6. **Betting Contract**: Bet placement and settlement

### WebRTC Architecture

For real-time device control:
- Use mediasoup or Janus Gateway for media server
- Target <100ms latency for control commands
- Implement fallback for high-latency connections
- Support multiple camera angles
- Record gameplay for replays

### Testing Strategy

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

Minimum 80% coverage for:
- Authentication logic
- Payment processing
- Smart contract interactions
- Game session management

## Key Features Implementation Order

### Phase 1: Foundation (Weeks 1-4)
1. Project setup and infrastructure
2. Database schema implementation
3. Authentication system (email + wallet)
4. Basic user profiles
5. CI/CD pipeline

### Phase 2: Core Features (Weeks 5-12)
1. Arena management system
2. Game session management
3. WebRTC integration for control
4. Basic blockchain integration (tokens)
5. Payment escrow system

### Phase 3: Advanced Features (Weeks 13-20)
1. Tournament system
2. Betting functionality
3. NFT marketplace
4. Social features (friends, chat, achievements)
5. Leaderboards

### Phase 4: Polish & Launch (Weeks 21-28)
1. Performance optimization
2. Security audit
3. Load testing
4. DAO governance
5. VR/AR integration
6. Public launch

## Important Architecture Decisions

### Tokenomics

**GAC (Government Arena Coin)**:
- Fixed supply: 100,000,000 tokens
- Used for governance and staking
- Deflationary (burn mechanism)
- 4 staking tiers: Bronze (1K), Silver (10K), Gold (50K), Platinum (100K)

**PAC (Play Arena Coin)**:
- Utility token for games
- Controlled inflation (5% APY, decreasing)
- 10% burn on transactions
- Used for entry fees and rewards

### Security Requirements

- JWT tokens (15min expiry) + refresh tokens (30 days)
- Row Level Security in PostgreSQL
- HTTPS everywhere
- Rate limiting (10 req/sec per IP)
- KYC verification for betting
- Multi-signature for critical operations

### Monitoring Setup

Required metrics:
- DAU/MAU (Daily/Monthly Active Users)
- ARPU (Average Revenue Per User)
- Active games count
- System latency (WebRTC)
- Error rates
- Transaction volumes

## Common Development Tasks

### Adding a New API Endpoint

1. Define route in appropriate module
2. Implement controller with business logic
3. Add Supabase RLS policies if needed
4. Write integration tests
5. Update API documentation
6. Add to CLAUDE.md if significant

### Adding a New Database Table

1. Write migration SQL
2. Add RLS policies
3. Create TypeScript types in shared/
4. Update relevant API endpoints
5. Add indexes for performance
6. Document in schema section

### Implementing WebRTC Feature

1. Set up signaling server (Socket.io)
2. Configure media server (mediasoup/Janus)
3. Implement client-side peer connection
4. Add latency monitoring
5. Test with real devices
6. Optimize for mobile

### Deploying Smart Contract

1. Write contract in Anchor framework
2. Write unit tests
3. Deploy to devnet
4. Integration testing
5. Security audit
6. Deploy to mainnet
7. Update frontend integration

## Coding Standards

### TypeScript

- Strict mode enabled
- No `any` types without justification
- Use interfaces for data structures
- Proper error handling with try/catch
- JSDoc comments for public APIs

### Testing

- Jest for unit/integration tests
- Playwright for E2E tests
- Test naming: `describe('Feature', () => { it('should...') })`
- Mock external services (blockchain, WebRTC)
- Aim for >80% coverage on critical paths

### Git Workflow

- Branch naming: `feature/`, `fix/`, `refactor/`
- Commit format: `[TYPE] Description`
- PR requires code review
- Squash commits on merge
- Keep commits atomic and focused

## Documentation References

- **SUPER_PROMPT.md**: Complete project context and architecture
- **PRD.md**: Detailed technical specifications (2700+ lines)
- **.taskmaster/**: Task management system
- **.claude-collective/**: Agent coordination system

## Remote Server Infrastructure (EXISTING)

### ⚠️ CRITICAL: Use Existing Infrastructure

**DO NOT create new instances of these services - they already exist:**

#### Existing Supabase Stack (`name: supabase`)
- **PostgreSQL 17**: `supabase-db` - Database with PostGIS, pgvector, OrioleDB
- **Supavisor**: Connection pooler at `supavisor:5432` (user format: `username.tenant_id`)
- **Redis**: `queue-redis` - Available for caching and queues (password: `${REDIS_PASSWORD}`)
- **MinIO/S3**: `minio` - Object storage at `minio.${MAIN_DOMAIN}`
- **Supabase Auth**: `supabase-auth` - GoTrue auth service
- **Supabase Storage**: `supabase-storage` - File storage with imgproxy
- **Supabase Realtime**: `realtime-dev.supabase-realtime` - Real-time subscriptions
- **Kong API Gateway**: `supabase-kong` - API routing at `api.${MAIN_DOMAIN}`
- **n8n**: `n8n` with 2 workers - Automation workflows at `n8n.${MAIN_DOMAIN}`
- **Neo4j**: `supabase-neo4j` - Graph database at `neo4j.${MAIN_DOMAIN}`

#### Existing Monitoring Stack (`name: monitoring`)
- **Prometheus**: `prometheus` - Metrics collection at `prometheus.${MAIN_DOMAIN}`
- **Grafana**: `grafana` - Dashboards at `monitoring.${MAIN_DOMAIN}`
- **Loki**: `loki` - Log aggregation
- **AlertManager**: `alertmanager` - Alerts at `alerts.${MAIN_DOMAIN}`
- **Node Exporter**: `node-exporter` - System metrics
- **cAdvisor**: `cadvisor` - Container metrics at `cadvisor.${MAIN_DOMAIN}`
- **Postgres Exporter**: `postgres-exporter` - DB metrics
- **Autoheal**: Auto-restart unhealthy containers
- **Watchtower**: Auto-update containers (4 AM daily)

#### Traefik Reverse Proxy (External)
- **Network**: `proxy` (external network)
- **SSL**: Automatic via Let's Encrypt (`letsencrypt` cert resolver)
- **NO OPEN PORTS**: All services exposed only through Traefik labels
- **Domain Pattern**: `service.${MAIN_DOMAIN}`

### Database Connection for ArenaHUB

**Use Supavisor connection pooler:**
```typescript
// Connection string format
const DB_URL = `postgresql://username.arenahub@supavisor:5432/${POSTGRES_DB}`

// Transaction mode (for migrations, DDL)
const TRANSACTION_URL = `postgresql://username.arenahub@supavisor:6543/${POSTGRES_DB}`
```

**Important:**
- Use format `username.tenant_id` where tenant_id = `arenahub`
- Create ArenaHUB schemas in existing Supabase database
- Use RLS (Row Level Security) for multi-tenancy
- Leverage existing Supabase Auth for authentication

### Redis Usage

**Connect to existing Redis:**
```typescript
const REDIS_URL = `redis://:${REDIS_PASSWORD}@queue-redis:6379/1` // Use DB 1 for ArenaHUB
```

**Use for:**
- Game session state
- Player queues
- Leaderboard caching
- Rate limiting
- Socket.io adapter (for horizontal scaling)

### n8n Automation

**Use existing n8n at `n8n.${MAIN_DOMAIN}`:**
- Email notifications (SMTP configured)
- Webhook handlers
- Scheduled tasks (cron jobs)
- External API integrations
- Payment processing workflows

### MinIO/S3 Storage

**Use existing MinIO:**
```typescript
const S3_CONFIG = {
  endpoint: 'http://minio:9000',
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
  bucket: 'arenahub' // Create new bucket for ArenaHUB
}
```

**Store:**
- Game replays (videos)
- User avatars
- Arena media (photos/videos)
- NFT metadata/images

### Monitoring Integration

**Add ArenaHUB metrics to existing Prometheus:**
1. Expose metrics endpoint: `/metrics` (port 9090)
2. Add scrape config to Prometheus
3. Create Grafana dashboards for ArenaHUB
4. Use existing Loki for logs

### ArenaHUB Services Architecture

**New services to deploy (in separate stack):**

```yaml
name: arenahub

services:
  # Backend API (Node.js/Express)
  api:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.arenahub-api.rule=Host(`arenahub.${MAIN_DOMAIN}`)"
      - "traefik.http.services.arenahub-api.loadbalancer.server.port=3000"
    networks:
      - default
      - proxy
      - supabase_default  # Connect to Supabase network

  # WebRTC Media Server (mediasoup/Janus)
  media:
    labels:
      - "traefik.http.routers.media.rule=Host(`media.${MAIN_DOMAIN}`)"
    networks:
      - default
      - proxy

  # Socket.io Server (for signaling)
  realtime:
    labels:
      - "traefik.http.routers.realtime.rule=Host(`ws.${MAIN_DOMAIN}`)"
    networks:
      - default
      - proxy

  # Frontend (Next.js SSR)
  frontend:
    labels:
      - "traefik.http.routers.arenahub.rule=Host(`${MAIN_DOMAIN}`)"
    networks:
      - default
      - proxy

networks:
  default:
    driver: bridge
  proxy:
    external: true
  supabase_default:
    external: true
```

### Deployment Checklist

1. **Database Setup:**
   - Create ArenaHUB tenant in Supavisor
   - Run schema migrations to Supabase DB
   - Set up RLS policies
   - Create necessary roles and permissions

2. **Redis Setup:**
   - No setup needed - use existing Redis
   - Use database index 1 for ArenaHUB (0 is n8n)

3. **MinIO Setup:**
   - Create `arenahub` bucket
   - Set bucket policies
   - Configure CORS for web access

4. **n8n Setup:**
   - Import ArenaHUB workflows
   - Configure webhook endpoints
   - Set up scheduled tasks

5. **Monitoring Setup:**
   - Add Prometheus scrape configs
   - Import Grafana dashboards
   - Configure alerts in AlertManager
   - Set up log shipping to Loki

6. **Traefik Labels:**
   - All services MUST have Traefik labels
   - NO ports exposed directly
   - Use `proxy` network for external access

### Environment Variables

```bash
# Supabase Connection
POSTGRES_HOST=supavisor
POSTGRES_PORT=5432
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=postgres.arenahub
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis
REDIS_HOST=queue-redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=1

# MinIO/S3
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=${MINIO_ROOT_USER}
S3_SECRET_KEY=${MINIO_ROOT_PASSWORD}
S3_BUCKET=arenahub

# Supabase Services
SUPABASE_URL=https://api.${MAIN_DOMAIN}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}

# n8n
N8N_WEBHOOK_URL=https://n8n.${MAIN_DOMAIN}/webhook

# Domain
MAIN_DOMAIN=${MAIN_DOMAIN}
```

---

## 🗣️ Language Preference

**ВАЖНО: Общаться с пользователем на русском языке!**

Claude должен:
- Отвечать на русском языке
- Комментарии в коде на английском (стандарт)
- Документация может быть на русском или английском
- Commit messages на английском
- API endpoints и переменные на английском

---

**Last Updated**: October 22, 2025
**Project Status**: Initial Development Phase
**Target Launch**: Q3 2026
