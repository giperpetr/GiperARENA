#!/bin/bash

# Скрипт для деплоя на сервер
# Использование: ./scripts/deploy-to-server.sh [service]

set -e

SERVICE=${1:-frontend}
SERVER_HOST="83.222.20.168"
SERVER_USER="root"
SERVER_PATH="/root/giperarena"
SSH_KEY="~/.ssh/giperarena_deploy"

echo "🚀 Деплой $SERVICE на сервер..."
echo "Сервер: $SERVER_HOST"

# Копируем файлы на сервер
echo "📤 Копирование файлов на сервер..."
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
scp -i "$SSH_KEY" .env "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/" 2>/dev/null || echo "⚠️ .env файл не найден, пропускаем"

# Подключаемся к серверу и обновляем контейнеры
echo "🔄 Обновление контейнеров на сервере..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << 'SSH_EOF'
cd /root/giperarena

echo "📥 Загрузка новых образов..."
docker compose -f docker-compose.prod.yml pull

echo "🛑 Остановка старых контейнеров..."
docker compose -f docker-compose.prod.yml down

echo "🧹 Очистка старых образов..."
docker image prune -f

echo "🚀 Запуск новых контейнеров..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Ожидание запуска контейнеров..."
sleep 10

echo "📊 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo "📝 Логи последних 20 строк:"
docker compose -f docker-compose.prod.yml logs --tail=20
SSH_EOF

echo "✅ Деплой завершён!"
echo "🌐 Проверьте сайт: https://giperarena.space"
