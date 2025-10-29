#!/bin/bash
# НАДЁЖНЫЙ ДЕПЛОЙ СКРИПТ для GiperARENA
# Использует SHA версионирование и принудительное обновление образов

set -e

PROJECT_DIR="/Users/giperpetr/Documents/Programming/ArenaHUB"
SERVER="root@83.222.20.168"
SERVER_DIR="/root/giperarena"  # ПРАВИЛЬНЫЙ ПУТЬ НА СЕРВЕРЕ!
SSH_KEY="$HOME/.ssh/giperarena_deploy"
DOCKER_USER="giperpetr"
DOCKER_TOKEN="${DOCKER_HUB_TOKEN:-}"  # Set via: export DOCKER_HUB_TOKEN=dckr_pat_...

cd "$PROJECT_DIR"

echo "🚀 НАДЁЖНЫЙ ДЕПЛОЙ GiperARENA"
echo "=============================="
echo ""

# Шаг 1: Git коммит и получение SHA
echo "📝 Шаг 1/7: Git commit и versioning..."
# Используем текущий HEAD без нового коммита
GIT_SHA=$(git rev-parse --short HEAD)
echo "✅ Версия: $GIT_SHA"
echo ""

# Шаг 2: Docker Hub login
echo "🔐 Шаг 2/7: Docker Hub login..."
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
echo ""

# Шаг 3: Сборка образа БЕЗ КЭША с SHA тегом
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

# Шаг 4: Обновление docker-compose.prod.yml с новым SHA
echo "📝 Шаг 4/7: Обновление docker-compose.prod.yml..."
sed -i '' "s|giperpetr/giperarena-frontend:.*|giperpetr/giperarena-frontend:${GIT_SHA}|" docker-compose.prod.yml
echo "✅ docker-compose.prod.yml обновлён"
echo ""

# Шаг 5: Загрузка docker-compose.prod.yml на сервер
echo "📤 Шаг 5/7: Загрузка docker-compose.prod.yml на сервер..."
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER:$SERVER_DIR/"
echo "✅ docker-compose.prod.yml загружен"
echo "⚠️  .env НЕ загружается - используем существующий production .env"
echo ""

# Шаг 6: Деплой на сервер с ПРИНУДИТЕЛЬНЫМ обновлением
echo "🚀 Шаг 6/7: Деплой на сервер..."
ssh -i "$SSH_KEY" "$SERVER" bash << ENDSSH
set -e
cd $SERVER_DIR

echo "🗑️  Удаление старых frontend образов..."
docker rmi giperpetr/giperarena-frontend:latest -f 2>/dev/null || true

echo "📥 Pull нового frontend образа БЕЗ КЭША (версия: ${GIT_SHA})..."
docker compose -f docker-compose.prod.yml pull --no-cache frontend

echo "🔄 Пересоздание frontend контейнера с --force-recreate..."
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend

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
