#!/bin/bash
# Диагностика проблем с фронтендом

echo "===== ДИАГНОСТИКА ФРОНТЕНДА GIPERARENA ====="
echo ""

cd /root/giperarena || exit 1

echo "1️⃣ Статус контейнера frontend:"
docker ps --filter name=giperarena-frontend --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2️⃣ Healthcheck контейнера:"
docker inspect giperarena-frontend | jq '.[0].State.Health' 2>/dev/null || echo "No health info"
echo ""

echo "3️⃣ Последние 20 строк логов frontend:"
docker logs giperarena-frontend --tail 20
echo ""

echo "4️⃣ Проверка доступности frontend изнутри контейнера:"
docker exec giperarena-frontend wget -q -O - http://localhost:3000/ | head -20
echo ""

echo "5️⃣ Проверка сети proxy:"
docker network inspect proxy | jq '.[0].Containers | to_entries[] | select(.value.Name | contains("giperarena"))'
echo ""

echo "6️⃣ Traefik labels на frontend:"
docker inspect giperarena-frontend | jq '.[0].Config.Labels | with_entries(select(.key | startswith("traefik")))'
echo ""

echo "7️⃣ Логи Traefik (последние 30 строк, фильтр giperarena):"
docker logs traefik --tail 30 2>&1 | grep -i giperarena || echo "No giperarena mentions in Traefik logs"
echo ""

echo "8️⃣ Traefik роутеры (API):"
curl -s http://localhost:8080/api/http/routers | jq '.[] | select(.name | contains("giperarena"))' 2>/dev/null || echo "Traefik API не доступен"
echo ""

echo "===== КОНЕЦ ДИАГНОСТИКИ ====="
