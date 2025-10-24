#!/bin/bash
# Скрипт для деплоя на сервере (выполняется по SSH)
set -e

echo "🚀 Deploying GiperARENA from Docker Hub"

cd /root/giperarena || mkdir -p /root/giperarena && cd /root/giperarena

# Останови старые контейнеры если есть
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Загрузи новые образы из Docker Hub
echo "📥 Pulling images from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

# Запусти контейнеры
echo "🔄 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

# Подожди 10 секунд
echo "⏳ Waiting 10 seconds for containers to start..."
sleep 10

# Проверь логи
echo "📋 Container logs:"
docker compose -f docker-compose.prod.yml logs --tail=50

# Проверь статус
echo ""
echo "✅ Container status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment complete! Check https://giperarena.space"
