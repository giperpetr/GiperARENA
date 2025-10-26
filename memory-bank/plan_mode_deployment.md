# 🚀 PLAN MODE - ПОЛНЫЙ ПЛАН РАЗВЕРТЫВАНИЯ ARENAHUB

## 🎯 ЦЕЛЬ
Развернуть весь стек ArenaHUB на удаленном сервере с учетом всех известных проблем и решений

## 📊 АНАЛИЗ КОМПОНЕНТОВ СТЕКА

### Основные сервисы
1. **Frontend** (Next.js) - Порт 3000
2. **Backend** (Node.js API) - Порт 8000  
3. **Realtime** (Socket.io) - Порт 3001
4. **Media** (WebRTC/mediasoup) - Порт 3002
5. **Blockchain** (Solana) - Порт 3003

### Существующая инфраструктура
- **Supabase Stack**: PostgreSQL, Redis, MinIO, n8n, Neo4j
- **Monitoring**: Prometheus, Grafana, Loki
- **Traefik**: Reverse proxy с SSL
- **Networks**: proxy, supabase_default, monitoring_default

---

## 🔧 ДЕТАЛЬНЫЙ ПЛАН РАЗВЕРТЫВАНИЯ

### Этап 1: Подготовка образов Docker

#### 1.1 Frontend (Next.js) - КРИТИЧЕСКИ ВАЖНО
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
# КРИТИЧЕСКИ: Dev mode в production!
CMD ["npm", "run", "dev"]
```

**Проблема**: Next.js production build падает с onClick handler errors
**Решение**: Используем dev mode в production (уже настроено)

#### 1.2 Backend (Node.js API)
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

#### 1.3 Realtime (Socket.io)
```dockerfile
# realtime/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

#### 1.4 Media (WebRTC/mediasoup)
```dockerfile
# media/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

#### 1.5 Blockchain (Solana)
```dockerfile
# blockchain/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

### Этап 2: Конфигурация Docker Compose

#### 2.1 docker-compose.prod.yml
```yaml
version: '3.9'

services:
  # Frontend (Next.js)
  frontend:
    image: giperpetr/giperarena-frontend:latest
    container_name: giperarena-frontend
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=development  # Dev mode!
      - PORT=3000
      - NEXT_TELEMETRY_DISABLED=1
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena.rule=Host(`giperarena.space`) || Host(`www.giperarena.space`)"
      - "traefik.http.routers.giperarena.entrypoints=websecure"
      - "traefik.http.routers.giperarena.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena.loadbalancer.server.port=3000"

  # Backend API
  backend:
    image: giperpetr/giperarena-backend:latest
    container_name: giperarena-backend
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - PORT=8000
    networks:
      - default
      - proxy
      - supabase_default
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena-api.rule=Host(`api.giperarena.space`)"
      - "traefik.http.routers.giperarena-api.entrypoints=websecure"
      - "traefik.http.routers.giperarena-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena-api.loadbalancer.server.port=8000"

  # Realtime WebSocket
  realtime:
    image: giperpetr/giperarena-realtime:latest
    container_name: giperarena-realtime
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - default
      - proxy
      - supabase_default
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena-ws.rule=Host(`ws.giperarena.space`)"
      - "traefik.http.routers.giperarena-ws.entrypoints=websecure"
      - "traefik.http.routers.giperarena-ws.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena-ws.loadbalancer.server.port=3001"

  # Media WebRTC
  media:
    image: giperpetr/giperarena-media:latest
    container_name: giperarena-media
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - PORT=3002
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena-media.rule=Host(`media.giperarena.space`)"
      - "traefik.http.routers.giperarena-media.entrypoints=websecure"
      - "traefik.http.routers.giperarena-media.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena-media.loadbalancer.server.port=3002"

  # Blockchain Solana
  blockchain:
    image: giperpetr/giperarena-blockchain:latest
    container_name: giperarena-blockchain
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=production
      - PORT=3003
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena-blockchain.rule=Host(`blockchain.giperarena.space`)"
      - "traefik.http.routers.giperarena-blockchain.entrypoints=websecure"
      - "traefik.http.routers.giperarena-blockchain.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena-blockchain.loadbalancer.server.port=3003"

networks:
  default:
    external: false
  proxy:
    external: true
  supabase_default:
    external: true
```

### Этап 3: Автоматизированный деплой

#### 3.1 Обновленный deploy-reliable.sh
```bash
#!/bin/bash
# ПОЛНЫЙ ДЕПЛОЙ ВСЕГО СТЕКА ARENAHUB

set -e

PROJECT_DIR="/Users/giperpetr/Documents/Programming/ArenaHUB"
SERVER="root@83.222.20.168"
SSH_KEY="$HOME/.ssh/giperarena_deploy"
DOCKER_USER="giperpetr"
DOCKER_TOKEN="${DOCKER_HUB_TOKEN:-}"

cd "$PROJECT_DIR"

echo "🚀 ПОЛНЫЙ ДЕПЛОЙ ARENAHUB STACK"
echo "==============================="
echo ""

# Шаг 1: Git commit и получение SHA
echo "📝 Шаг 1/8: Git commit и versioning..."
git add -A
git diff --staged --quiet && echo "⚠️  Нет изменений для коммита" || {
  read -p "Введи сообщение коммита: " COMMIT_MSG
  git commit -m "$COMMIT_MSG"
  git push origin master
}

GIT_SHA=$(git rev-parse --short HEAD)
echo "✅ Версия: $GIT_SHA"
echo ""

# Шаг 2: Docker Hub login
echo "🔐 Шаг 2/8: Docker Hub login..."
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
echo ""

# Шаг 3: Сборка Frontend
echo "🏗️  Шаг 3/8: Сборка Frontend (NO CACHE)..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-frontend:${GIT_SHA} \
  -t giperpetr/giperarena-frontend:latest \
  -f frontend/Dockerfile \
  --push .

echo "✅ Frontend образ собран: $GIT_SHA"
echo ""

# Шаг 4: Сборка Backend
echo "🏗️  Шаг 4/8: Сборка Backend..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-backend:${GIT_SHA} \
  -t giperpetr/giperarena-backend:latest \
  -f backend/Dockerfile \
  --push .

echo "✅ Backend образ собран: $GIT_SHA"
echo ""

# Шаг 5: Сборка Realtime
echo "🏗️  Шаг 5/8: Сборка Realtime..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-realtime:${GIT_SHA} \
  -t giperpetr/giperarena-realtime:latest \
  -f realtime/Dockerfile \
  --push .

echo "✅ Realtime образ собран: $GIT_SHA"
echo ""

# Шаг 6: Сборка Media
echo "🏗️  Шаг 6/8: Сборка Media..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-media:${GIT_SHA} \
  -t giperpetr/giperarena-media:latest \
  -f media/Dockerfile \
  --push .

echo "✅ Media образ собран: $GIT_SHA"
echo ""

# Шаг 7: Сборка Blockchain
echo "🏗️  Шаг 7/8: Сборка Blockchain..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-blockchain:${GIT_SHA} \
  -t giperpetr/giperarena-blockchain:latest \
  -f blockchain/Dockerfile \
  --push .

echo "✅ Blockchain образ собран: $GIT_SHA"
echo ""

# Шаг 8: Загрузка конфигов
echo "📤 Шаг 8/8: Загрузка конфигов на сервер..."
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER:/root/giperarena/"
scp -i "$SSH_KEY" .env "$SERVER:/root/giperarena/"
echo "✅ Конфиги загружены"
echo ""

# Шаг 9: Деплой на сервер
echo "🚀 Шаг 9/8: Деплой на сервер..."
ssh -i "$SSH_KEY" "$SERVER" bash << ENDSSH
set -e
cd /root/giperarena

echo "🗑️  Удаление старых образов..."
docker rmi giperpetr/giperarena-frontend:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-backend:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-realtime:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-media:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-blockchain:latest -f 2>/dev/null || true

echo "📥 Pull новых образов (версия: ${GIT_SHA})..."
docker compose -f docker-compose.prod.yml pull --no-cache

echo "🔄 Пересоздание контейнеров..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate

echo "⏳ Ожидание запуска (60 секунд)..."
sleep 60

echo ""
echo "📊 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Логи frontend:"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

echo ""
echo "📋 Логи backend:"
docker compose -f docker-compose.prod.yml logs --tail=20 backend
ENDSSH

echo ""
echo "✅ Деплой завершён!"
echo ""

# Шаг 10: Верификация
echo "🔍 Шаг 10/8: Верификация..."
sleep 10

echo "Проверка основных сервисов:"
echo "Frontend: https://giperarena.space"
HTTP_CODE_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" https://giperarena.space/)
echo "  HTTP Code: $HTTP_CODE_FRONTEND"

echo "Backend API: https://api.giperarena.space"
HTTP_CODE_API=$(curl -s -o /dev/null -w "%{http_code}" https://api.giperarena.space/)
echo "  HTTP Code: $HTTP_CODE_API"

echo "WebSocket: https://ws.giperarena.space"
HTTP_CODE_WS=$(curl -s -o /dev/null -w "%{http_code}" https://ws.giperarena.space/)
echo "  HTTP Code: $HTTP_CODE_WS"

echo "Media: https://media.giperarena.space"
HTTP_CODE_MEDIA=$(curl -s -o /dev/null -w "%{http_code}" https://media.giperarena.space/)
echo "  HTTP Code: $HTTP_CODE_MEDIA"

echo "Blockchain: https://blockchain.giperarena.space"
HTTP_CODE_BLOCKCHAIN=$(curl -s -o /dev/null -w "%{http_code}" https://blockchain.giperarena.space/)
echo "  HTTP Code: $HTTP_CODE_BLOCKCHAIN"

echo ""
if [ "$HTTP_CODE_FRONTEND" = "200" ]; then
  echo "✅ Основной сайт работает! HTTP $HTTP_CODE_FRONTEND"
  echo "🌐 https://giperarena.space"
else
  echo "❌ Проблема с основным сайтом! HTTP $HTTP_CODE_FRONTEND"
  echo "Проверь логи на сервере"
fi

echo ""
echo "🎉 ПОЛНЫЙ ДЕПЛОЙ СТЕКА ARENAHUB ВЕРСИИ $GIT_SHA ЗАВЕРШЁН!"
```

---

## 🔍 МОНИТОРИНГ И ОТЛАДКА

### Проверка статуса всех сервисов
```bash
# Проверка контейнеров
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml ps"

# Проверка логов всех сервисов
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs --tail=50"

# Проверка конкретного сервиса
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs frontend"
```

### Проверка доступности
```bash
# Основные сервисы
curl -I https://giperarena.space/                    # Frontend
curl -I https://api.giperarena.space/                # Backend API
curl -I https://ws.giperarena.space/                 # WebSocket
curl -I https://media.giperarena.space/              # Media WebRTC
curl -I https://blockchain.giperarena.space/         # Blockchain
```

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА

### ✅ ВСЕГДА делай:
1. **Git commit перед деплоем** - для SHA версионирования
2. **--no-cache** при сборке всех образов - избегай старого кэша
3. **docker rmi** старых образов на сервере - принудительное обновление
4. **--force-recreate** при запуске - пересоздание контейнеров
5. **Dev mode для frontend** - Next.js dev server работает стабильно
6. **Проверка всех сервисов** - верификация каждого компонента

### ❌ НИКОГДА не делай:
1. **GitHub Actions** - минуты кончились
2. **Деплой без --no-cache** - будет старый кэш
3. **Деплой без --force-recreate** - будут старые контейнеры
4. **Production build Next.js** - падает с onClick errors
5. **Пропуск проверки сервисов** - может привести к неработающему стеку

---

## 🎯 РЕЗУЛЬТАТ

После выполнения плана:
- ✅ **Frontend**: https://giperarena.space (Next.js dev mode)
- ✅ **Backend API**: https://api.giperarena.space (Node.js)
- ✅ **WebSocket**: https://ws.giperarena.space (Socket.io)
- ✅ **Media WebRTC**: https://media.giperarena.space (mediasoup)
- ✅ **Blockchain**: https://blockchain.giperarena.space (Solana)
- ✅ **SSL сертификаты** настроены автоматически
- ✅ **Интеграция** с существующей инфраструктурой
- ✅ **Мониторинг** и логирование работают
- ✅ **Надежная схема** обновления через Docker Hub

**Статус**: Готов к полному развертыванию! 🚀

---

## 🚀 КОМАНДЫ ДЛЯ ЗАПУСКА

```bash
# Установка прав
chmod +x scripts/deploy-reliable.sh

# Установка Docker Hub токена
export DOCKER_HUB_TOKEN="dckr_pat_..."

# Запуск полного деплоя
./scripts/deploy-reliable.sh
```

**План готов к выполнению!** 🎯
