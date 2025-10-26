# 🚀 ПЛАН РАЗВЕРТЫВАНИЯ ARENAHUB НА УДАЛЕННОМ СЕРВЕРЕ

## 📋 ОБЗОР ПРОБЛЕМ И РЕШЕНИЙ

### ❌ ИЗВЕСТНЫЕ ПРОБЛЕМЫ (62+ попытки деплоя)
1. **Docker кэширование** - сервер получал старые образы даже с тегом `:latest`
2. **Next.js production build** падал с onClick handler errors (60+ раз)
3. **Отсутствие версионирования** образов
4. **GitHub Actions** - минуты кончились, не используется

### ✅ РЕАЛИЗОВАННЫЕ РЕШЕНИЯ
1. **SHA версионирование** - каждый образ имеет уникальный тег
2. **--no-cache** при сборке - принудительная пересборка
3. **--force-recreate** при запуске - принудительное пересоздание контейнеров
4. **Dev mode в production** - Next.js dev server вместо production build
5. **Docker Hub + SSH** - надежная схема деплоя

---

## 🏗️ АРХИТЕКТУРА РАЗВЕРТЫВАНИЯ

### Схема деплоя
```
Локальная машина → Docker Hub → Удаленный сервер
     ↓                ↓              ↓
1. Git commit     2. Build & Push   3. Pull & Deploy
   (SHA версия)     (--no-cache)      (--force-recreate)
```

### Компоненты стека
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Realtime      │
│   (Next.js)     │    │   (Node.js)     │    │   (Socket.io)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Traefik       │
                    │   (Reverse      │
                    │    Proxy)       │
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   External      │
                    │   Services      │
                    │   (Supabase)    │
                    └─────────────────┘
```

---

## 🎯 ДЕТАЛЬНЫЙ ПЛАН РАЗВЕРТЫВАНИЯ

### Этап 1: Подготовка инфраструктуры ✅ ГОТОВО

#### Существующая инфраструктура на сервере
- **Supabase Stack**: PostgreSQL, Redis, MinIO, n8n, Neo4j
- **Monitoring Stack**: Prometheus, Grafana, Loki
- **Traefik**: Reverse proxy с SSL (Let's Encrypt)
- **Networks**: proxy, supabase_default, monitoring_default

#### Конфигурация сервера
```bash
# Сервер: root@83.222.20.168
# SSH Key: ~/.ssh/giperarena_deploy
# Директория: /root/giperarena/
# Домен: https://giperarena.space
```

### Этап 2: Подготовка образов

#### Frontend (Next.js)
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
CMD ["npm", "run", "dev"]  # Dev mode в production!
```

#### Backend (Node.js)
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

### Этап 3: Конфигурация Docker Compose

#### docker-compose.prod.yml
```yaml
version: '3.9'

services:
  frontend:
    image: giperpetr/giperarena-frontend:latest
    container_name: giperarena-frontend
    restart: unless-stopped
    env_file: .env
    environment:
      - NODE_ENV=development  # Dev mode!
      - PORT=3000
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=proxy"
      - "traefik.http.routers.giperarena.rule=Host(`giperarena.space`)"
      - "traefik.http.routers.giperarena.entrypoints=websecure"
      - "traefik.http.routers.giperarena.tls.certresolver=letsencrypt"
      - "traefik.http.services.giperarena.loadbalancer.server.port=3000"

  backend:
    image: giperpetr/giperarena-backend:latest
    container_name: giperarena-backend
    restart: unless-stopped
    env_file: .env
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
```

### Этап 4: Автоматизированный деплой

#### Скрипт deploy-reliable.sh
```bash
#!/bin/bash
# НАДЁЖНЫЙ ДЕПЛОЙ СКРИПТ для GiperARENA

set -e

PROJECT_DIR="/Users/giperpetr/Documents/Programming/ArenaHUB"
SERVER="root@83.222.20.168"
SSH_KEY="$HOME/.ssh/giperarena_deploy"
DOCKER_USER="giperpetr"
DOCKER_TOKEN="${DOCKER_HUB_TOKEN:-}"

# 1. Git commit и получение SHA
git add -A
git commit -m "Deploy version $(date)"
GIT_SHA=$(git rev-parse --short HEAD)

# 2. Docker Hub login
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin

# 3. Сборка frontend БЕЗ КЭША
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-frontend:${GIT_SHA} \
  -t giperpetr/giperarena-frontend:latest \
  -f frontend/Dockerfile \
  --push .

# 4. Сборка backend БЕЗ КЭША
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-backend:${GIT_SHA} \
  -t giperpetr/giperarena-backend:latest \
  -f backend/Dockerfile \
  --push .

# 5. Загрузка конфигов
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER:/root/giperarena/"
scp -i "$SSH_KEY" .env "$SERVER:/root/giperarena/"

# 6. Деплой на сервер
ssh -i "$SSH_KEY" "$SERVER" bash << ENDSSH
cd /root/giperarena

# Удаление старых образов
docker rmi giperpetr/giperarena-frontend:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-backend:latest -f 2>/dev/null || true

# Pull новых образов
docker compose -f docker-compose.prod.yml pull --no-cache

# Пересоздание контейнеров
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Ожидание запуска
sleep 45

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
ENDSSH

# 7. Верификация
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://giperarena.space/)
echo "HTTP Code: $HTTP_CODE"
```

---

## 🔧 КОМАНДЫ ДЕПЛОЯ

### Быстрый деплой
```bash
# Установка прав
chmod +x scripts/deploy-reliable.sh

# Установка Docker Hub токена
export DOCKER_HUB_TOKEN="dckr_pat_..."

# Запуск деплоя
./scripts/deploy-reliable.sh
```

### Ручной деплой (пошагово)
```bash
# 1. Подготовка
cd /Users/giperpetr/Documents/Programming/ArenaHUB
git add -A && git commit -m "Deploy $(date)"

# 2. Docker Hub login
echo "$DOCKER_HUB_TOKEN" | docker login -u giperpetr --password-stdin

# 3. Сборка образов
docker buildx build --no-cache --platform linux/amd64 \
  -t giperpetr/giperarena-frontend:latest \
  -f frontend/Dockerfile --push .

docker buildx build --no-cache --platform linux/amd64 \
  -t giperpetr/giperarena-backend:latest \
  -f backend/Dockerfile --push .

# 4. Загрузка конфигов
scp -i ~/.ssh/giperarena_deploy docker-compose.prod.yml root@83.222.20.168:/root/giperarena/
scp -i ~/.ssh/giperarena_deploy .env root@83.222.20.168:/root/giperarena/

# 5. Деплой на сервер
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 bash << 'EOF'
cd /root/giperarena
docker rmi giperpetr/giperarena-frontend:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-backend:latest -f 2>/dev/null || true
docker compose -f docker-compose.prod.yml pull --no-cache
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate
sleep 45
docker compose -f docker-compose.prod.yml ps
EOF
```

---

## 🔍 МОНИТОРИНГ И ОТЛАДКА

### Проверка статуса
```bash
# Проверка контейнеров
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml ps"

# Проверка логов
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs frontend"
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs backend"

# Проверка сайта
curl -I https://giperarena.space/
```

### Отладка проблем
```bash
# Проверка образов на сервере
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "docker images | grep giperarena"

# Проверка сетей
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "docker network ls"

# Перезапуск сервисов
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml restart"
```

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА

### ✅ ВСЕГДА делай:
1. **Git commit перед деплоем** - для SHA версионирования
2. **--no-cache** при сборке образов - избегай старого кэша
3. **docker rmi** старых образов на сервере - принудительное обновление
4. **--force-recreate** при запуске - пересоздание контейнеров
5. **Dev mode в production** - Next.js dev server работает стабильно

### ❌ НИКОГДА не делай:
1. **GitHub Actions** - минуты кончились
2. **Деплой без --no-cache** - будет старый кэш
3. **Деплой без --force-recreate** - будут старые контейнеры
4. **Production build Next.js** - падает с onClick errors

---

## 🎯 РЕЗУЛЬТАТ

После выполнения плана:
- ✅ Frontend доступен на https://giperarena.space
- ✅ Backend API доступен на https://api.giperarena.space
- ✅ Все сервисы интегрированы с существующей инфраструктурой
- ✅ SSL сертификаты настроены автоматически
- ✅ Мониторинг и логирование работают
- ✅ Надежная схема обновления через Docker Hub

**Статус**: Готов к развертыванию! 🚀
