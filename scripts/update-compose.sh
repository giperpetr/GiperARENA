#!/bin/bash

# Скрипт для обновления docker-compose.prod.yml с новыми тегами
# Использование: ./scripts/update-compose.sh [service] [tag]

set -e

SERVICE=${1:-frontend}
TAG=${2:-$(git rev-parse --short HEAD)}

echo "📝 Обновление docker-compose.prod.yml..."
echo "Сервис: $SERVICE"
echo "Тег: $TAG"

# Создаём временный файл
TEMP_FILE=$(mktemp)

# Обновляем тег в docker-compose.prod.yml
sed "s/giperpetr\/giperarena-$SERVICE:[^[:space:]]*/giperpetr\/giperarena-$SERVICE:$TAG/g" docker-compose.prod.yml > "$TEMP_FILE"

# Заменяем оригинальный файл
mv "$TEMP_FILE" docker-compose.prod.yml

echo "✅ docker-compose.prod.yml обновлён!"
echo "Новый тег для $SERVICE: giperpetr/giperarena-$SERVICE:$TAG"
