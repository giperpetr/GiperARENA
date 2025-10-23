# Getting Started with ArenaHUB Development

## 🚀 First Time Setup

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 8+** - `npm install -g pnpm`
- **Docker & Docker Compose** - [Download](https://www.docker.com/)
- **Goose** (for migrations) - See installation below

### 1. Install Dependencies

```bash
# Enable pnpm
corepack enable pnpm

# Install all dependencies (monorepo)
pnpm install

# This will install dependencies for all packages:
# - frontend
# - backend
# - realtime
# - media
# - blockchain
# - shared
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables:**
```bash
# From your existing Supabase stack
POSTGRES_PASSWORD=your-postgres-password
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
REDIS_PASSWORD=your-redis-password
MINIO_ROOT_USER=your-minio-user
MINIO_ROOT_PASSWORD=your-minio-password

# Your domain
MAIN_DOMAIN=your-domain.com
```

### 3. Install Goose (Database Migrations)

**Option A: Using Go**
```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
```

**Option B: Using Docker**
```bash
# Use via Docker (no installation needed)
alias goose='docker run --rm -v "$PWD/backend/migrations:/migrations" --network host ghcr.io/pressly/goose:latest'
```

**Option C: Using Homebrew (Mac)**
```bash
brew install goose
```

### 4. Run Database Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:5432/postgres?sslmode=disable"

# Run migrations
cd backend
goose -dir migrations postgres "$DATABASE_URL" up

# Check status
goose -dir migrations postgres "$DATABASE_URL" status
```

Expected output:
```
OK    00001_create_schema.sql
OK    00002_create_users_table.sql
```

---

## 💻 Development

### Local Development (without Docker)

```bash
# Terminal 1: Build shared package (watch mode)
cd shared
pnpm run dev

# Terminal 2: Start backend
cd backend
pnpm run dev

# Terminal 3: Start frontend
cd frontend
pnpm run dev

# Terminal 4: Start realtime server
cd realtime
pnpm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

### Docker Development

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

**Access (via Traefik):**
- Frontend: https://your-domain.com
- Backend API: https://arenahub.your-domain.com
- WebSocket: wss://ws.your-domain.com
- Media Server: https://media.your-domain.com

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @arenahub/backend test

# Run with coverage
pnpm test:coverage

# Type checking
pnpm type-check
```

---

## 🏗️ Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @arenahub/backend build

# Clean all builds
pnpm clean
```

---

## 📊 Database Management

### Create New Migration

```bash
cd backend

# Create migration file
goose -dir migrations create add_arenas_table sql

# This creates: migrations/TIMESTAMP_add_arenas_table.sql
```

### Migration Commands

```bash
# Run migrations
pnpm migrate:up

# Rollback last migration
pnpm migrate:down

# Check migration status
pnpm migrate:status

# Reset database (CAREFUL!)
pnpm migrate:reset
```

### Direct Database Access

```bash
# Via Supavisor (recommended)
psql "postgresql://postgres.arenahub:${POSTGRES_PASSWORD}@supavisor:5432/postgres"

# Direct to database
psql "postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres"
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Typescript errors

```bash
# Build shared package first
cd shared && pnpm run build

# Then build other packages
cd ../backend && pnpm run build
```

### Docker build fails

```bash
# Clean Docker cache
docker compose down
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache
```

### Database connection errors

```bash
# Check if Supabase stack is running
cd /root/server/supabase
docker compose ps

# Check database is accessible
psql "postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/postgres" -c "SELECT 1"
```

### Port already in use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## 📚 Project Structure

```
ArenaHUB/
├── backend/           # Node.js API server
│   ├── src/
│   │   └── index.ts   # Entry point
│   ├── migrations/    # Goose SQL migrations
│   ├── Dockerfile
│   └── package.json
│
├── frontend/          # Next.js 15 app
│   ├── src/
│   │   └── app/       # App Router
│   ├── Dockerfile
│   └── package.json
│
├── realtime/          # Socket.io server
│   ├── src/
│   │   └── index.ts
│   └── package.json
│
├── media/             # WebRTC media server
│   ├── src/
│   │   └── index.ts
│   └── package.json
│
├── blockchain/        # Solana contracts
│   ├── programs/      # Rust contracts
│   └── service/       # Node.js service
│
├── shared/            # Shared types/utils
│   └── src/
│       ├── types/
│       ├── constants/
│       └── utils/
│
└── docker-compose.yml # Docker services
```

---

## 🔗 Useful Links

- **Supabase Studio**: https://studio.${MAIN_DOMAIN}
- **n8n Automation**: https://n8n.${MAIN_DOMAIN}
- **Grafana Monitoring**: https://monitoring.${MAIN_DOMAIN}
- **MinIO Storage**: https://minio.${MAIN_DOMAIN}

---

## 📖 Next Steps

1. **Read Documentation**:
   - [CLAUDE.md](CLAUDE.md) - Development guidelines
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
   - [PRD.md](PRD.md) - Full product requirements

2. **Start Developing**:
   - Check Task Master tasks: `task-master list`
   - Pick next task: `task-master next`
   - Start coding!

3. **Join the Team**:
   - Review coding standards in CLAUDE.md
   - Set up your IDE with TypeScript/ESLint
   - Ask questions in team chat

---

**Happy Coding! 🚀**

*Last updated: October 22, 2025*
