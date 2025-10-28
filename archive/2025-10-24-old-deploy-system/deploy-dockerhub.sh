#!/bin/bash
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
DOCKER_USERNAME="${DOCKER_USERNAME:-giperpetr}"
DOCKER_PASSWORD="${DOCKER_PASSWORD}"
REGISTRY="docker.io/${DOCKER_USERNAME}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
SERVER="${SERVER:-root@83.222.20.168}"
PROJECT_NAME="giperarena"

echo -e "${BLUE}🚀 Автоматический деплой GiperARENA на Docker Hub${NC}"
echo "======================================="

# 1. Git commit and push
echo -e "\n${YELLOW}📝 Сохраняем код в GitHub...${NC}"
COMMIT_MSG="deploy: автоматический деплой $(date '+%Y-%m-%d %H:%M:%S')"
git add .
git commit -m "$COMMIT_MSG" || echo "Нет изменений для коммита"
echo -e "${GREEN}✅ Создан коммит: $COMMIT_MSG${NC}"

git push origin master
echo -e "${GREEN}✅ Код отправлен в GitHub${NC}"

# 2. Login to Docker Hub
echo -e "\n${YELLOW}🔐 Логинимся в Docker Hub...${NC}"

if [ -z "$DOCKER_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  DOCKER_PASSWORD не установлен${NC}"
    echo -e "${YELLOW}Введите пароль от Docker Hub:${NC}"
    docker login
else
    echo "$DOCKER_PASSWORD" | docker login -u $DOCKER_USERNAME --password-stdin 2>/dev/null || {
        echo -e "${RED}❌ Не удалось войти в Docker Hub${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ Успешный вход в Docker Hub${NC}"

# 3. Build and push multi-platform images
echo -e "\n${YELLOW}🐳 Собираем multi-platform Docker образы...${NC}"

GIT_SHA=$(git rev-parse --short HEAD)

echo -e "${BLUE}Собираем frontend для linux/amd64 и linux/arm64...${NC}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${REGISTRY}/${PROJECT_NAME}-frontend:latest \
  -t ${REGISTRY}/${PROJECT_NAME}-frontend:${GIT_SHA} \
  -f frontend/Dockerfile \
  --push \
  . || {
    echo -e "${RED}❌ Ошибка сборки frontend${NC}"
    exit 1
}

echo -e "${BLUE}Собираем backend для linux/amd64 и linux/arm64...${NC}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${REGISTRY}/${PROJECT_NAME}-backend:latest \
  -t ${REGISTRY}/${PROJECT_NAME}-backend:${GIT_SHA} \
  -f backend/Dockerfile \
  --push \
  . || {
    echo -e "${RED}❌ Ошибка сборки backend${NC}"
    exit 1
}

echo -e "${GREEN}✅ Multi-platform образы собраны и отправлены в Docker Hub (SHA: ${GIT_SHA})${NC}"

# 4. Deploy to server
echo -e "\n${YELLOW}🔄 Обновляем контейнеры на сервере...${NC}"

ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
    cd /root/giperarena

    echo "🔽 Загружаем новые multi-arch образы..."
    docker pull giperpetr/giperarena-frontend:latest
    docker pull giperpetr/giperarena-backend:latest

    echo "🔄 Останавливаем старые контейнеры..."
    docker stop giperarena-frontend giperarena-backend || true
    docker rm giperarena-frontend giperarena-backend || true

    echo "🚀 Запускаем новые контейнеры..."
    
    # Frontend
    docker run -d \
      --name giperarena-frontend \
      --restart unless-stopped \
      --network proxy \
      --network supabase_default \
      -e NEXT_PUBLIC_API_URL=https://api.giperarena.space \
      -e NEXT_PUBLIC_WS_URL=wss://ws.giperarena.space \
      -e NEXT_PUBLIC_MEDIA_URL=https://media.giperarena.space \
      -e NEXT_PUBLIC_SUPABASE_URL=https://api.giperarena.space \
      -e NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY} \
      --label "traefik.enable=true" \
      --label "traefik.http.routers.giperarena.rule=Host(\`giperarena.space\`)" \
      --label "traefik.http.routers.giperarena.entrypoints=websecure" \
      --label "traefik.http.routers.giperarena.tls.certresolver=letsencrypt" \
      --label "traefik.http.services.giperarena.loadbalancer.server.port=3000" \
      giperpetr/giperarena-frontend:latest

    # Backend
    docker run -d \
      --name giperarena-backend \
      --restart unless-stopped \
      --network proxy \
      --network supabase_default \
      --label "traefik.enable=true" \
      --label "traefik.http.routers.giperarena-api.rule=Host(\`api.giperarena.space\`)" \
      --label "traefik.http.routers.giperarena-api.entrypoints=websecure" \
      --label "traefik.http.routers.giperarena-api.tls.certresolver=letsencrypt" \
      --label "traefik.http.services.giperarena-api.loadbalancer.server.port=3000" \
      giperpetr/giperarena-backend:latest

    echo "⏳ Ждём запуска контейнеров..."
    sleep 15

    echo "🧹 Очищаем старые образы..."
    docker image prune -f

    echo ""
    echo "📊 Статус контейнеров:"
    docker ps --filter "name=giperarena" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

    echo ""
    echo "🔍 Проверяем логи frontend:"
    docker logs --tail 10 giperarena-frontend

    echo ""
    echo "🔍 Проверяем логи backend:"
    docker logs --tail 10 giperarena-backend
ENDSSH

echo -e "\n${GREEN}✅ Деплой завершён успешно!${NC}"
echo "======================================="
echo -e "🌐 Frontend:     ${BLUE}https://giperarena.space${NC}"
echo -e "🔧 Backend API:  ${BLUE}https://api.giperarena.space${NC}"
echo -e "📦 Git SHA:      ${BLUE}${GIT_SHA}${NC}"
echo -e "🐳 Registry:     ${BLUE}Docker Hub (docker.io)${NC}"
