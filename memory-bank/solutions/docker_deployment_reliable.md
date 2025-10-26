# Docker Deployment Reliable Solution

**Дата создания:** 26 октября 2025  
**Проблема:** Docker кэширование и нестабильный деплой  
**Статус:** Решено

---

## 🐛 Проблема

### Симптомы
- Сервер получает старые образы даже с тегом `:latest`
- Docker кэширование мешает обновлениям
- Деплой не всегда обновляет контейнеры
- Нужно вручную удалять образы на сервере

### Причина
Docker кэширует образы локально и на сервере. Даже с тегом `:latest` может использоваться старый кэшированный образ.

---

## ✅ Решение

### 1. SHA Версионирование
**Принцип:** Каждый образ имеет уникальный тег на основе Git SHA

```bash
#!/bin/bash
# deploy-reliable.sh

# Получение SHA версии
GIT_SHA=$(git rev-parse --short HEAD)
echo "Версия: $GIT_SHA"

# Сборка с SHA тегом
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-frontend:${GIT_SHA} \
  -t giperpetr/giperarena-frontend:latest \
  --push .
```

### 2. Принудительное обновление
**Принцип:** Удаление старых образов и принудительное пересоздание

```bash
# На сервере
docker rmi giperpetr/giperarena-frontend:latest -f
docker compose -f docker-compose.prod.yml pull --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### 3. Полный скрипт деплоя

```bash
#!/bin/bash
# scripts/deploy-reliable.sh

set -e

PROJECT_DIR="/Users/giperpetr/Documents/Programming/ArenaHUB"
SERVER="root@83.222.20.168"
SSH_KEY="$HOME/.ssh/giperarena_deploy"
DOCKER_USER="giperpetr"
DOCKER_TOKEN="${DOCKER_HUB_TOKEN:-}"

cd "$PROJECT_DIR"

echo "🚀 НАДЁЖНЫЙ ДЕПЛОЙ GiperARENA"
echo "=============================="
echo ""

# Шаг 1: Git коммит и получение SHA
echo "📝 Шаг 1/7: Git commit и versioning..."
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
echo "🔐 Шаг 2/7: Docker Hub login..."
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
echo ""

# Шаг 3: Сборка frontend БЕЗ КЭША с SHA тегом
echo "🏗️  Шаг 3/7: Сборка frontend образа (NO CACHE)..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-frontend:${GIT_SHA} \
  -t giperpetr/giperarena-frontend:latest \
  -f frontend/Dockerfile \
  --push .

echo "✅ Frontend образ собран: $GIT_SHA"
echo ""

# Шаг 4: Сборка backend
echo "🏗️  Шаг 4/7: Сборка backend образа..."
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t giperpetr/giperarena-backend:${GIT_SHA} \
  -t giperpetr/giperarena-backend:latest \
  -f backend/Dockerfile \
  --push .

echo "✅ Backend образ собран: $GIT_SHA"
echo ""

# Шаг 5: Загрузка конфигов на сервер
echo "📤 Шаг 5/7: Загрузка конфигов на сервер..."
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER:/root/giperarena/"
scp -i "$SSH_KEY" .env "$SERVER:/root/giperarena/"
echo "✅ Конфиги загружены"
echo ""

# Шаг 6: Деплой на сервер с ПРИНУДИТЕЛЬНЫМ обновлением
echo "🚀 Шаг 6/7: Деплой на сервер..."
ssh -i "$SSH_KEY" "$SERVER" bash << ENDSSH
set -e
cd /root/giperarena

echo "🗑️  Удаление старых образов..."
docker rmi giperpetr/giperarena-frontend:latest -f 2>/dev/null || true
docker rmi giperpetr/giperarena-backend:latest -f 2>/dev/null || true

echo "📥 Pull новых образов (версия: ${GIT_SHA})..."
docker compose -f docker-compose.prod.yml pull --no-cache

echo "🔄 Пересоздание контейнеров..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate

echo "⏳ Ожидание запуска (45 секунд)..."
sleep 45

echo ""
echo "📊 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Логи frontend:"
docker compose -f docker-compose.prod.yml logs --tail=50 frontend | tail -30
ENDSSH

echo ""
echo "✅ Деплой завершён!"
echo ""

# Шаг 7: Верификация
echo "🔍 Шаг 7/7: Верификация..."
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://giperarena.space/)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Сайт работает! HTTP $HTTP_CODE"
  echo "🌐 https://giperarena.space"
else
  echo "❌ Проблема! HTTP $HTTP_CODE"
  echo "Проверь логи на сервере"
fi

echo ""
echo "🎉 ДЕПЛОЙ ВЕРСИИ $GIT_SHA ЗАВЕРШЁН!"
```

---

## 🔧 Конфигурация

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: giperpetr/giperarena-frontend:latest
    container_name: giperarena-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.giperarena.space
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.arenahub.rule=Host(`giperarena.space`)"
      - "traefik.http.routers.arenahub.entrypoints=websecure"
      - "traefik.http.routers.arenahub.tls.certresolver=letsencrypt"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    image: giperpetr/giperarena-backend:latest
    container_name: giperarena-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - proxy
      - supabase_default
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  proxy:
    external: true
  supabase_default:
    external: true
```

### Environment Variables

```bash
# .env (на сервере)
MAIN_DOMAIN=giperarena.space
POSTGRES_PASSWORD=your_password
REDIS_PASSWORD=your_redis_password
MINIO_ROOT_USER=your_minio_user
MINIO_ROOT_PASSWORD=your_minio_password
JWT_SECRET=your_jwt_secret
ANON_KEY=your_supabase_anon_key
SERVICE_ROLE_KEY=your_supabase_service_key
```

---

## 🚀 Использование

### 1. Настройка окружения

```bash
# Установка Docker Hub token
export DOCKER_HUB_TOKEN="dckr_pat_your_token_here"

# Создание SSH ключа для деплоя
ssh-keygen -t rsa -b 4096 -f ~/.ssh/giperarena_deploy
ssh-copy-id -i ~/.ssh/giperarena_deploy.pub root@83.222.20.168
```

### 2. Запуск деплоя

```bash
# Переход в директорию проекта
cd /Users/giperpetr/Documents/Programming/ArenaHUB

# Запуск деплоя
chmod +x scripts/deploy-reliable.sh
./scripts/deploy-reliable.sh
```

### 3. Проверка статуса

```bash
# SSH на сервер
ssh root@83.222.20.168

# Проверка контейнеров
cd /root/giperarena
docker compose -f docker-compose.prod.yml ps

# Проверка логов
docker compose -f docker-compose.prod.yml logs -f frontend
```

---

## 🔍 Troubleshooting

### Проблема: Сервер показывает старую версию

```bash
# SSH на сервер
ssh root@83.222.20.168
cd /root/giperarena

# Принудительное обновление
docker rmi giperpetr/giperarena-frontend:latest -f
docker compose -f docker-compose.prod.yml pull --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

### Проблема: Docker Hub login failed

```bash
# Проверка токена
echo $DOCKER_HUB_TOKEN

# Ручной login
docker login -u giperpetr
# Ввести пароль или токен
```

### Проблема: SSH connection failed

```bash
# Проверка SSH ключа
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168

# Если не работает, пересоздать ключ
ssh-keygen -t rsa -b 4096 -f ~/.ssh/giperarena_deploy
ssh-copy-id -i ~/.ssh/giperarena_deploy.pub root@83.222.20.168
```

### Проблема: Контейнер не запускается

```bash
# Проверка логов
docker compose -f docker-compose.prod.yml logs frontend

# Проверка конфигурации
docker compose -f docker-compose.prod.yml config

# Перезапуск с принудительным пересозданием
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## 📊 Мониторинг

### Health Checks

```yaml
# В docker-compose.prod.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Логирование

```bash
# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f frontend

# Логи с фильтрацией
docker compose -f docker-compose.prod.yml logs --tail=100 frontend | grep ERROR
```

### Метрики

```bash
# Использование ресурсов
docker stats

# Размер образов
docker images | grep giperarena

# Использование диска
docker system df
```

---

## 🔄 Автоматизация

### GitHub Actions (опционально)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        run: |
          echo "${{ secrets.DOCKER_HUB_TOKEN }}" | docker login -u giperpetr --password-stdin
          ./scripts/deploy-reliable.sh
        env:
          DOCKER_HUB_TOKEN: ${{ secrets.DOCKER_HUB_TOKEN }}
```

### Cron Job (если нужно)

```bash
# Добавить в crontab
# Деплой каждый день в 2:00 AM
0 2 * * * cd /Users/giperpetr/Documents/Programming/ArenaHUB && ./scripts/deploy-reliable.sh
```

---

## 📋 Best Practices

### 1. Всегда делай
- ✅ Git commit перед деплоем
- ✅ `--no-cache` при сборке образов
- ✅ `--force-recreate` при запуске контейнеров
- ✅ Проверяй логи после деплоя
- ✅ Тестируй локально перед деплоем

### 2. Никогда не делай
- ❌ Деплой без git commit
- ❌ Использование только тега `:latest`
- ❌ `docker compose up -d` без `--force-recreate`
- ❌ Деплой без проверки логов
- ❌ Игнорирование ошибок

### 3. Регулярно
- 🔄 Очищай старые образы: `docker system prune -a`
- 🔄 Обновляй зависимости
- 🔄 Проверяй размер образов
- 🔄 Мониторь использование ресурсов

---

## 🎯 Результат

### До решения
- ❌ Нестабильный деплой
- ❌ Старые образы на сервере
- ❌ Ручное удаление образов
- ❌ Непредсказуемые результаты

### После решения
- ✅ Надёжный деплой
- ✅ Всегда актуальные образы
- ✅ Автоматическое обновление
- ✅ Предсказуемые результаты

---

**Последнее обновление:** 26 октября 2025  
**Статус:** Решено  
**Использование:** Активно в production
