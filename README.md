# ArenaHUB 🎮🤖

> **Remote-Controlled Gaming Platform** - Control real robots, drones, and machines from anywhere in the world. Compete in tournaments, place bets, earn cryptocurrency.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](docker-compose.yml)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-15%2B-black.svg)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/solana-mainnet-purple.svg)](https://solana.com/)

---

## 🌟 What is ArenaHUB?

ArenaHUB bridges the physical and digital worlds by allowing players worldwide to control real robotic devices on physical arenas in real-time. Experience the thrill of:

- 🎮 **Real-Time Control** - Sub-100ms latency WebRTC streaming
- 🏆 **Competitive Gaming** - Tournaments with real prizes
- 💰 **Betting System** - Place bets on games and tournaments
- 🪙 **Cryptocurrency** - Earn GAC/PAC tokens
- 🖼️ **NFT Marketplace** - Trade arena devices and achievements
- 🗳️ **DAO Governance** - Community-driven platform decisions

---

## 🏗️ Architecture

### Server Structure

```
/root/
├── server/                    # Existing infrastructure (DO NOT MODIFY)
│   ├── supabase/              # PostgreSQL, Redis, MinIO, n8n
│   └── monitoring/            # Prometheus, Grafana, Loki
│
└── arenahub/                  # This project
    ├── frontend/              # Next.js 15 web app
    ├── backend/               # Node.js API server
    ├── realtime/              # Socket.io WebSocket server
    ├── media/                 # WebRTC media server (mediasoup)
    ├── blockchain/            # Solana smart contracts
    └── shared/                # Shared TypeScript types
```

### Tech Stack

**Frontend:**
- Next.js 15 + React 19
- TypeScript 5+
- Tailwind CSS 4
- shadcn/ui components
- Zustand + React Query

**Backend:**
- Node.js + Express/Fastify
- PostgreSQL 17 (Supabase)
- Redis (caching + queues)
- Socket.io (WebSocket)
- mediasoup (WebRTC)

**Blockchain:**
- Solana mainnet
- Anchor framework
- Metaplex (NFTs)

**Infrastructure (Existing):**
- Traefik (reverse proxy + SSL)
- MinIO (S3-compatible storage)
- n8n (automation)
- Prometheus + Grafana (monitoring)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- Access to server with existing Supabase/Monitoring stacks

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd arenahub

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env

# Install dependencies (all packages)
npm install

# Start development servers
npm run dev

# Or start individual services
npm run dev:frontend    # Next.js at http://localhost:3000
npm run dev:backend     # API at http://localhost:3001
npm run dev:realtime    # WebSocket at http://localhost:3002
```

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

---

## 📦 Project Structure

```
arenahub/
├── frontend/              # Next.js 15 application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and helpers
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
│
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── middleware/    # Express middleware
│   └── migrations/        # Database migrations
│
├── realtime/              # Socket.io server
│   └── src/
│       ├── handlers/      # WebSocket event handlers
│       └── services/      # Game session management
│
├── media/                 # WebRTC media server
│   └── src/
│       ├── router.ts      # mediasoup routing
│       ├── peer.ts        # Peer connection management
│       └── recorder.ts    # Game replay recording
│
├── blockchain/            # Solana smart contracts
│   ├── programs/          # Rust/Anchor contracts
│   │   ├── gac-token/     # Governance token
│   │   ├── pac-token/     # Utility token
│   │   ├── escrow/        # Game fee escrow
│   │   ├── staking/       # Token staking
│   │   ├── nft/           # NFT marketplace
│   │   ├── dao/           # DAO governance
│   │   └── betting/       # Betting system
│   └── service/           # Blockchain integration service
│
├── shared/                # Shared code
│   └── src/
│       ├── types/         # Shared TypeScript types
│       ├── constants/     # Shared constants
│       └── utils/         # Shared utilities
│
├── scripts/               # Deployment scripts
├── monitoring/            # Monitoring configs
├── n8n-workflows/         # Automation workflows
└── docs/                  # Documentation
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Domain
MAIN_DOMAIN=your-domain.com

# Supabase (from existing stack)
POSTGRES_PASSWORD=xxx
ANON_KEY=xxx
SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx

# Redis (from existing stack)
REDIS_PASSWORD=xxx

# MinIO (from existing stack)
MINIO_ROOT_USER=xxx
MINIO_ROOT_PASSWORD=xxx

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

See `.env.example` for full configuration options.

### Database Setup

```bash
# Run migrations
cd backend
npm run migrate

# Seed initial data (optional)
npm run seed
```

---

## 🚢 Deployment

### Server Deployment

```bash
# SSH to server
ssh root@your-server.com

# Navigate to project directory
cd /root/giperarena

# Pull latest changes
git pull origin main

# Build Docker images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.

### Deploy Smart Contracts

```bash
cd blockchain

# Build contracts
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Update .env with program IDs
```

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Development guide for Claude Code
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[PRD.md](PRD.md)** - Product requirements (2700+ lines)
- **[SUPER_PROMPT.md](SUPER_PROMPT.md)** - Complete project context
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** - 28-week roadmap
- **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)** - Design System полная документация
- **[frontend/README.md](frontend/README.md)** - Frontend quick start
- **[backend/README.md](backend/README.md)** - Backend API documentation

### API Documentation

Once deployed, access Swagger/OpenAPI docs at:
- `https://arenahub.${MAIN_DOMAIN}/api/docs`

### Live Design System

Access interactive design system documentation at:
- Local: `http://localhost:3000/design-system`
- Production: `https://${MAIN_DOMAIN}/design-system`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in specific package
npm run test:backend
npm run test:frontend
npm run test:blockchain

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 📊 Monitoring

Access monitoring dashboards:
- **Grafana**: `https://monitoring.${MAIN_DOMAIN}`
- **Prometheus**: `https://prometheus.${MAIN_DOMAIN}`
- **Alerts**: `https://alerts.${MAIN_DOMAIN}`

---

## 🤝 Contributing

This is a private project. For internal team members:

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

### Code Style

- TypeScript strict mode
- ESLint + Prettier configured
- Pre-commit hooks via Husky
- Commit format: `[TYPE] Description`

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file

---

## 🔗 Links

- **Website**: `https://${MAIN_DOMAIN}`
- **API**: `https://arenahub.${MAIN_DOMAIN}`
- **Docs**: `https://arenahub.${MAIN_DOMAIN}/docs`
- **Status**: `https://monitoring.${MAIN_DOMAIN}`

---

## 📞 Support

For internal support:
- Check logs: `docker compose logs -f`
- Review [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
- Contact DevOps team

---

**Built with ❤️ for the future of remote-controlled gaming**

*Last updated: October 22, 2025*
