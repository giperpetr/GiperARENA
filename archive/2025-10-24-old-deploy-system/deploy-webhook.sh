#!/bin/bash
# Public deployment script - can be executed via curl
set -e

echo "🚀 GiperARENA Webhook Deployment"
echo "================================"

cd /root/giperarena || { echo "❌ Directory not found"; exit 1; }

echo "📥 Pulling Docker images from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo "🔄 Stopping old containers..."
docker compose -f docker-compose.prod.yml down

echo "🚀 Starting new containers..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting 20 seconds for startup..."
sleep 20

echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Frontend Logs:"
docker compose -f docker-compose.prod.yml logs --tail=50 frontend

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Check: https://giperarena.space"
