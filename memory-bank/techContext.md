# Technical Context - ArenaHUB

**Дата обновления:** 26 октября 2025  
**Технологический стек и конфигурации**

---

## 🛠️ Технологический стек

### Frontend
- **Next.js 15** - React framework с App Router
- **React 19** - UI библиотека с новыми features
- **TypeScript 5+** - Типизированный JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Компоненты на базе Radix UI
- **Zustand** - State management
- **React Query** - Data fetching и caching
- **Framer Motion** - Анимации
- **Socket.io Client** - WebSocket соединения

### Backend
- **Node.js 20** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Типизированный JavaScript
- **PostgreSQL 17** - Основная база данных (Supabase)
- **Redis** - Кэширование и очереди
- **Socket.io** - WebSocket сервер
- **JWT** - Аутентификация
- **BullMQ** - Job queue (планируется)

### WebRTC & Media
- **mediasoup** - WebRTC media server
- **Janus Gateway** - Альтернативный media server
- **GStreamer** - Видео обработка (на Raspberry Pi)
- **WebRTC** - Real-time коммуникация

### Blockchain
- **Solana** - Blockchain платформа
- **Anchor Framework** - Solana smart contracts
- **Web3.js** - Blockchain взаимодействие
- **Metaplex** - NFT стандарт

### Infrastructure
- **Docker** - Контейнеризация
- **Docker Compose** - Orchestration
- **Traefik** - Reverse proxy + SSL
- **MinIO** - S3-совместимое хранилище
- **Prometheus** - Метрики
- **Grafana** - Дашборды
- **Loki** - Логирование

---

## 🏗️ Архитектура системы

### Микросервисная архитектура
```
┌─────────────────────────────────────────────────────────┐
│                    TRAEFIK PROXY                        │
│              (SSL, Load Balancing, Routing)             │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│   FRONTEND   │  │   BACKEND   │  │   REALTIME  │
│  (Next.js)   │  │   (API)     │  │ (Socket.io) │
└───────┬──────┘  └──────┬──────┘  └──────┬──────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│    MEDIA     │  │ BLOCKCHAIN  │  │  DATABASE   │
│ (WebRTC)     │  │  SERVICE    │  │(PostgreSQL) │
└──────────────┘  └─────────────┘  └──────┬──────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
                    │   REDIS   │  │   MINIO   │  │ MONITORING│
                    │ (Cache)   │  │ (Storage) │  │(Prometheus)│
                    └───────────┘  └───────────┘  └───────────┘
```

### Сетевая топология
```
Internet
    │
    ▼
┌─────────────┐
│   Traefik   │ ← SSL Termination, Load Balancing
│  (Port 80/443) │
└─────┬───────┘
      │
      ├─── Frontend (giperarena.space)
      ├─── API (api.giperarena.space)
      ├─── WebSocket (ws.giperarena.space)
      └─── Media (media.giperarena.space)
```

---

## 🗄️ База данных

### PostgreSQL 17 (Supabase)
**Схема:** `arenahub`  
**Подключение:** Supavisor connection pooler

#### Основные таблицы
```sql
-- Пользователи
CREATE TABLE arenahub.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE,
    email TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('player', 'organizer', 'admin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Арены
CREATE TABLE arenahub.arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES arenahub.users(id),
    name TEXT NOT NULL,
    arena_type TEXT CHECK (arena_type IN ('robot_race', 'drone_race', 'robot_battle')),
    status TEXT CHECK (status IN ('draft', 'active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Игровые сессии
CREATE TABLE arenahub.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES arenahub.arenas(id),
    status TEXT CHECK (status IN ('waiting', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Индексы для производительности
```sql
-- Пользователи
CREATE INDEX idx_users_wallet ON arenahub.users(wallet_address);
CREATE INDEX idx_users_username ON arenahub.users(username);

-- Арены
CREATE INDEX idx_arenas_owner ON arenahub.arenas(owner_id);
CREATE INDEX idx_arenas_type ON arenahub.arenas(arena_type);
CREATE INDEX idx_arenas_status ON arenahub.arenas(status);

-- Сессии
CREATE INDEX idx_sessions_arena ON arenahub.game_sessions(arena_id);
CREATE INDEX idx_sessions_status ON arenahub.game_sessions(status);
```

#### Row Level Security (RLS)
```sql
-- Включение RLS
ALTER TABLE arenahub.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenahub.game_sessions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY user_data_policy ON arenahub.users
    FOR ALL TO authenticated
    USING (auth.uid() = id);

CREATE POLICY arena_view_policy ON arenahub.arenas
    FOR SELECT TO authenticated
    USING (true);
```

### Redis
**Назначение:** Кэширование, очереди, WebSocket state  
**Подключение:** `redis://:${REDIS_PASSWORD}@queue-redis:6379`

#### Использование по базам данных
- **DB 0** - n8n (существующий)
- **DB 1** - ArenaHUB API кэш
- **DB 2** - ArenaHUB WebSocket state
- **DB 3** - ArenaHUB WebRTC state
- **DB 4** - ArenaHUB Blockchain queue

---

## 🌐 Сетевые конфигурации

### Traefik Reverse Proxy
**Конфигурация:** Labels в docker-compose.yml

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.arenahub.rule=Host(`giperarena.space`)"
  - "traefik.http.routers.arenahub.entrypoints=websecure"
  - "traefik.http.routers.arenahub.tls.certresolver=letsencrypt"
```

### SSL сертификаты
**Провайдер:** Let's Encrypt  
**Автообновление:** Включено  
**Домены:**
- `giperarena.space` - Frontend
- `api.giperarena.space` - Backend API
- `ws.giperarena.space` - WebSocket
- `media.giperarena.space` - WebRTC Media

### CORS настройки
```typescript
const corsOptions = {
  origin: [
    'https://giperarena.space',
    'https://api.giperarena.space',
    'https://media.giperarena.space'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🔧 Конфигурации окружения

### Frontend (.env)
```bash
# API URLs
NEXT_PUBLIC_API_URL=https://api.giperarena.space
NEXT_PUBLIC_WS_URL=wss://ws.giperarena.space
NEXT_PUBLIC_MEDIA_URL=https://media.giperarena.space

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.gipergiraffe.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}

# Application
NODE_ENV=production
PORT=3000
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres.giper_prod:${POSTGRES_PASSWORD}@supavisor:5432/${POSTGRES_DB}
DATABASE_TRANSACTION_URL=postgresql://postgres.giper_prod:${POSTGRES_PASSWORD}@supavisor:6543/${POSTGRES_DB}

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@queue-redis:6379/1

# MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=${MINIO_ROOT_USER}
S3_SECRET_KEY=${MINIO_ROOT_PASSWORD}
S3_BUCKET=giperarena

# Auth
JWT_SECRET=${JWT_SECRET}
SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}

# Application
NODE_ENV=production
PORT=3000
```

### WebRTC Media (.env)
```bash
# mediasoup config
MEDIASOUP_ANNOUNCED_IP=${SERVER_IP}
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999

# Redis for state
REDIS_URL=redis://:${REDIS_PASSWORD}@queue-redis:6379/3

# Recording
RECORDING_ENABLED=true
RECORDING_BUCKET=giperarena
```

---

## 🐳 Docker конфигурации

### Frontend Dockerfile
```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps
# Install dependencies

FROM node:20-alpine AS builder
# Build application

FROM node:20-alpine AS runtime
# Production runtime
CMD ["npx", "next", "start"]
```

### Backend Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    environment:
      - NODE_ENV=production
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.arenahub.rule=Host(`giperarena.space`)"

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - proxy
      - supabase_default

networks:
  proxy:
    external: true
  supabase_default:
    external: true
```

---

## 🔐 Безопасность

### Аутентификация
**JWT токены:**
- **Access token:** 15 минут
- **Refresh token:** 30 дней
- **Алгоритм:** HS256

**Supabase Auth:**
- Email/password аутентификация
- Social OAuth (Google, Twitter, Discord)
- Wallet connection (Phantom, Solflare)

### Авторизация
**Роли пользователей:**
- `player` - может играть, делать ставки
- `organizer` - может создавать арены
- `admin` - полный доступ
- `viewer` - только просмотр

**Row Level Security:**
- Пользователи видят только свои данные
- Арены видны всем, редактировать может владелец
- Сессии видны участникам

### Rate Limiting
**API ограничения:**
- Неавторизованные: 100 req/hour
- Авторизованные: 1000 req/hour
- Premium (staked GAC): 10000 req/hour

**WebRTC ограничения:**
- Команды управления: 50 commands/second
- Chat messages: 5 messages/10 seconds

---

## 📊 Мониторинг

### Prometheus метрики
```typescript
// Application metrics
const httpRequestsTotal = new prometheus.Counter({
  name: 'arenahub_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status']
});

// WebRTC metrics
const webrtcConnections = new prometheus.Gauge({
  name: 'arenahub_webrtc_connections',
  help: 'Active WebRTC connections',
  labelNames: ['arena_id']
});
```

### Grafana дашборды
- **Platform Overview** - общие метрики
- **Arena Performance** - производительность арен
- **WebRTC Quality** - качество соединений
- **Financial** - финансовые метрики

### Логирование
**Структура логов:**
```json
{
  "timestamp": "2025-10-26T14:23:45.123Z",
  "level": "info",
  "service": "api-gateway",
  "traceId": "abc123",
  "userId": "user789",
  "message": "User joined session",
  "metadata": {
    "sessionId": "session456",
    "arenaId": "arena123"
  }
}
```

---

## 🚀 Деплой

### Процесс деплоя
1. **Git commit** → получение SHA версии
2. **Docker build** с `--no-cache`
3. **Docker push** в Docker Hub
4. **SSH на сервер** → обновление
5. **docker compose pull** с `--no-cache`
6. **docker compose up** с `--force-recreate`

### Скрипт деплоя
```bash
#!/bin/bash
# deploy-reliable.sh
GIT_SHA=$(git rev-parse --short HEAD)

# Build with SHA versioning
docker buildx build --no-cache \
  -t giperpetr/giperarena-frontend:${GIT_SHA} \
  -t giperpetr/giperarena-frontend:latest \
  --push .

# Deploy to server
ssh root@server "cd /root/giperarena && \
  docker compose pull --no-cache && \
  docker compose up -d --force-recreate"
```

---

## 🔧 Разработка

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Запуск всех сервисов
npm run dev

# Запуск отдельных сервисов
npm run dev:frontend
npm run dev:backend
npm run dev:realtime
```

### Тестирование
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Линтинг и форматирование
```bash
# ESLint
npm run lint

# Prettier
npm run format

# Type checking
npm run type-check
```

---

## 📋 Требования к системе

### Минимальные требования
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **Network:** 100 Mbps

### Рекомендуемые требования
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 50GB SSD
- **Network:** 1 Gbps

### Production требования
- **CPU:** 8+ cores
- **RAM:** 16+ GB
- **Storage:** 100+ GB SSD
- **Network:** 10+ Gbps

---

**Последнее обновление:** 26 октября 2025  
**Следующий обзор:** 2 ноября 2025
