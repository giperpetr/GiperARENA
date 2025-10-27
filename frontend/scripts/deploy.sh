#!/bin/bash

# Главный скрипт деплоя
# Использование: ./scripts/deploy.sh [service]

set -e

SERVICE=${1:-frontend}
TAG=$(git rev-parse --short HEAD)

echo "🚀 ПОЛНЫЙ ДЕПЛОЙ $SERVICE"
echo "Тег: $TAG"
echo "================================"

# Шаг 1: Сборка образа для AMD64
echo "📦 Шаг 1: Сборка образа для AMD64..."
./scripts/build-amd64.sh "$SERVICE" "$TAG"

# Шаг 2: Обновление docker-compose.prod.yml
echo "📝 Шаг 2: Обновление docker-compose.prod.yml..."
./scripts/update-compose.sh "$SERVICE" "$TAG"

# Шаг 3: Деплой на сервер
echo "🌐 Шаг 3: Деплой на сервер..."
./scripts/deploy-to-server.sh "$SERVICE"

echo "================================"
echo "✅ ДЕПЛОЙ ЗАВЕРШЁН!"
echo "🌐 Сайт: https://giperarena.space"
echo "🏷️ Тег: $TAG"
