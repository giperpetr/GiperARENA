#!/bin/bash

# Скрипт для сборки Docker образа для AMD64 архитектуры
# Использование: ./scripts/build-amd64.sh [service] [tag]

set -e

SERVICE=${1:-frontend}
TAG=${2:-$(git rev-parse --short HEAD)}

echo "🔨 Сборка образа для AMD64 архитектуры..."
echo "Сервис: $SERVICE"
echo "Тег: $TAG"

# Создаём buildx builder если не существует
if ! docker buildx ls | grep -q "amd64-builder"; then
    echo "📦 Создание buildx builder для AMD64..."
    docker buildx create --name amd64-builder --use
else
    echo "📦 Использование существующего buildx builder..."
    docker buildx use amd64-builder
fi

# Собираем образ для AMD64
echo "🏗️ Сборка образа giperpetr/giperarena-$SERVICE:$TAG для linux/amd64..."
docker buildx build --load \
    --platform linux/amd64 \
    --no-cache \
    -t "giperpetr/giperarena-$SERVICE:$TAG" \
    -f "$SERVICE/Dockerfile" \
    . \
    

echo "✅ Образ успешно собран и запушен в Docker Hub!"
echo "Тег: giperpetr/giperarena-$SERVICE:$TAG"

# Пушим образ в Docker Hub
echo "📤 Загрузка образа в Docker Hub..."
docker push "giperpetr/giperarena-$SERVICE:$TAG"
