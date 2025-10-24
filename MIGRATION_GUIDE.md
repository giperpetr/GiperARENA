# 📚 Инструкция по миграции проектов с GitHub Actions на локальный Docker Hub деплой

## 🎯 Цель миграции

Переход от GitHub Actions (которые жрут платные минуты) к локальной сборке Docker образов на Mac с последующей заливкой в Docker Hub и деплоем на сервер.

---

## ⚠️ КРИТИЧЕСКИЕ ПРЕДВАРИТЕЛЬНЫЕ УСЛОВИЯ

### 1. Проверь структуру проекта

**Monorepo структура** (как в Kholopye):
```
project/
├── apps/
│   ├── admin/           # React приложение
│   ├── customer-app/    # React приложение
│   └── shared/          # Общие типы
├── backend/             # Node.js backend (опционально)
├── go-api/              # Go backend (опционально)
├── .github/workflows/   # GitHub Actions (будем отключать)
├── scripts/             # Скрипты деплоя (создадим)
└── docker-compose.yml   # На сервере
```

**Одиночное приложение**:
```
project/
├── src/                 # Исходники
├── Dockerfile           # Dockerfile в корне
├── .github/workflows/   # GitHub Actions (будем отключать)
└── scripts/             # Скрипты деплоя (создадим)
```

### 2. Проверь наличие Dockerfile

**Для monorepo** нужны Dockerfile в каждом приложении:
- `apps/admin/Dockerfile`
- `apps/customer-app/Dockerfile`

**Для одиночного приложения** - `Dockerfile` в корне.

### 3. Проверь переменные окружения

**КРИТИЧНО!** Найди файл с переменными окружения (обычно `env.txt`, `.env.production`, или в GitHub Secrets).

**Нужны ключи Supabase:**
```bash
VITE_SUPABASE_URL=https://api.your-domain.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...  # для customer app
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # для admin
```

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

## ШАГ 1: Отключи GitHub Actions

```bash
# Переименуй все .yml файлы в .yml.disabled
cd .github/workflows/
for file in *.yml; do
  mv "$file" "${file}.disabled"
done

# Закоммить изменения
git add .
git commit -m "chore: отключены GitHub Actions для экономии минут"
git push
```

✅ **Проверка**: зайди на GitHub → Actions → не должно быть активных workflows

---

## ШАГ 2: Создай .dockerignore файлы

**КРИТИЧНО для избежания ошибки "operation not permitted"!**

### Для monorepo - в каждом приложении:

**apps/admin/.dockerignore**:
```
# Git
.git
.gitignore

# Node
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist
build
.vite

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage
.nyc_output

# Misc
*.log
.cache
```

Скопируй этот же файл в `apps/customer-app/.dockerignore` и в любые другие приложения.

### Для одиночного приложения - в корне:

Создай `.dockerignore` в корне проекта с тем же содержимым.

---

## ШАГ 3: Исправь Dockerfile для multi-platform сборки

### Для monorepo:

**ВАЖНО**: Build context для Docker = корень проекта (`.`), поэтому все пути должны быть полными!

**apps/admin/Dockerfile** (пример):
```dockerfile
# syntax=docker/dockerfile:1

# =========================================
# Stage 1: Build Environment
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# КРИТИЧНО: полные пути от корня проекта!
COPY apps/admin/package*.json ./
COPY apps/admin/package-lock.json ./

RUN npm ci && npm cache clean --force

# КРИТИЧНО: копируем весь app директорий
COPY apps/admin/ .

# Объявляем build arguments для Vite
ARG VITE_SUPABASE_URL=https://api.your-domain.com
ARG VITE_SUPABASE_ANON_KEY=your-anon-key
ARG VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Передаем их как ENV для использования во время сборки
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_SERVICE_ROLE_KEY=$VITE_SUPABASE_SERVICE_ROLE_KEY

RUN npm run build

# =========================================
# Stage 2: Production Runtime
# =========================================
FROM nginx:alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

# КРИТИЧНО: полный путь к nginx конфигу
COPY apps/admin/default.conf /etc/nginx/conf.d/default.conf

# Создаем пользователя nginx для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Устанавливаем правильные права доступа
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

USER nextjs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**⚠️ Важные моменты:**
1. Все `COPY` команды должны использовать полные пути: `COPY apps/admin/...`
2. ARG/ENV переменные должны быть объявлены **ПОСЛЕ** копирования кода, **ПЕРЕД** `npm run build`
3. Замени значения `VITE_SUPABASE_*` на свои из `env.txt`

### Для одиночного приложения:

Если Dockerfile в корне, пути проще:
```dockerfile
COPY package*.json ./
COPY . .
COPY default.conf /etc/nginx/conf.d/default.conf
```

---

## ШАГ 4: Обнови .env файлы с правильными ключами

### Найди правильные ключи:

Обычно в файле `env.txt` в корне проекта:
```bash
ANON_KEY=eyJhbGciOiJI...
SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

### Обнови .env файлы:

**apps/admin/.env**:
```bash
VITE_SUPABASE_URL=https://api.your-domain.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...  # из ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # из SERVICE_ROLE_KEY
```

**apps/customer-app/.env**:
```bash
VITE_SUPABASE_URL=https://api.your-domain.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...  # из ANON_KEY
VITE_TELEGRAM_BOT_URL=http://YOUR_SERVER_IP:3000
```

---

## ШАГ 5: Проверь Supabase клиенты

**КРИТИЧНО!** Если у вас есть разные схемы БД (app, inventory, sales и т.д.), нужны отдельные клиенты!

### Проверь файл `src/services/supabase.ts` (или аналогичный):

```typescript
// ✅ ПРАВИЛЬНО - для схемы inventory:
export const inventoryAPI = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    headers: {
      'Accept-Profile': 'inventory',
      'Content-Profile': 'inventory',
    },
  },
  db: {
    schema: 'inventory'
  },
});

// ❌ НЕПРАВИЛЬНО - дефолтный клиент для всего:
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Проверь API сервисы:

**Пример проблемного кода**:
```typescript
// ❌ НЕПРАВИЛЬНО
import { supabase } from '../supabase';

const { data, error } = await supabase
  .from('warehouses')  // таблица в схеме inventory!
  .select('*');
```

**Исправленный код**:
```typescript
// ✅ ПРАВИЛЬНО
import { inventoryAPI } from '../supabase';

const { data, error } = await inventoryAPI
  .from('warehouses')
  .select('*');
```

**Как найти проблемные места**:
```bash
# Найди все файлы, которые используют supabase вместо специфичных клиентов
grep -r "await supabase" src/services/api/ --include="*.ts"
```

---

## ШАГ 6: Создай скрипт деплоя

**scripts/deploy-dockerhub.sh**:
```bash
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
SSH_KEY="${SSH_KEY:-~/.ssh/fermer_deploy}"
SERVER="${SERVER:-root@82.202.131.239}"

echo -e "${BLUE}🚀 Автоматический деплой на Docker Hub${NC}"
echo "======================================"

# 1. Git commit and push
echo -e "\n${YELLOW}📝 Сохраняем код в GitHub...${NC}"
COMMIT_MSG="deploy: автоматический деплой $(date '+%Y-%m-%d %H:%M:%S')"
git add .
git commit -m "$COMMIT_MSG" || echo "Нет изменений для коммита"
echo -e "${GREEN}✅ Создан коммит: $COMMIT_MSG${NC}"

git push origin main
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

# ====================================
# НАСТРОЙ ПОД СВОЙ ПРОЕКТ!
# ====================================

# Для monorepo с несколькими приложениями:
echo -e "${BLUE}Собираем admin для linux/amd64 и linux/arm64...${NC}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${REGISTRY}/your-project-admin:latest \
  -t ${REGISTRY}/your-project-admin:${GIT_SHA} \
  -f apps/admin/Dockerfile \
  --push \
  . || {
    echo -e "${RED}❌ Ошибка сборки admin${NC}"
    exit 1
}

echo -e "${BLUE}Собираем customer-app для linux/amd64 и linux/arm64...${NC}"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${REGISTRY}/your-project-app:latest \
  -t ${REGISTRY}/your-project-app:${GIT_SHA} \
  -f apps/customer-app/Dockerfile \
  --push \
  . || {
    echo -e "${RED}❌ Ошибка сборки customer-app${NC}"
    exit 1
}

# Для одиночного приложения:
# docker buildx build \
#   --platform linux/amd64,linux/arm64 \
#   -t ${REGISTRY}/your-project:latest \
#   -t ${REGISTRY}/your-project:${GIT_SHA} \
#   --push \
#   . || {
#     echo -e "${RED}❌ Ошибка сборки${NC}"
#     exit 1
# }

echo -e "${GREEN}✅ Multi-platform образы собраны и отправлены в Docker Hub (SHA: ${GIT_SHA})${NC}"

# 4. Deploy to server
echo -e "\n${YELLOW}🔄 Обновляем контейнеры на сервере...${NC}"

ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
    cd /root/your-project  # НАСТРОЙ ПУТЬ!

    echo "🔽 Загружаем новые multi-arch образы..."
    docker compose pull admin customer-app  # НАСТРОЙ ИМЕНА СЕРВИСОВ!

    echo "🔄 Перезапускаем контейнеры..."
    docker compose up -d --no-deps --force-recreate admin customer-app

    echo "⏳ Ждём запуска контейнеров..."
    sleep 10

    echo "🧹 Очищаем старые образы..."
    docker image prune -f

    echo ""
    echo "📊 Статус контейнеров:"
    docker ps --filter "name=admin" --filter "name=customer-app" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

    echo ""
    echo "🔍 Проверяем логи customer-app:"
    docker logs --tail 10 customer-app

    echo ""
    echo "🔍 Проверяем логи admin:"
    docker logs --tail 10 admin
ENDSSH

echo -e "\n${GREEN}✅ Деплой завершён успешно!${NC}"
echo "======================================"
echo -e "🌐 Customer App: ${BLUE}https://app.your-domain.com${NC}"
echo -e "🔧 Admin Panel:  ${BLUE}https://admin.your-domain.com${NC}"
echo -e "📦 Git SHA:      ${BLUE}${GIT_SHA}${NC}"
echo -e "🐳 Registry:     ${BLUE}Docker Hub (docker.io)${NC}"
```

**Сделай скрипт исполняемым**:
```bash
chmod +x scripts/deploy-dockerhub.sh
```

---

## ШАГ 7: Обнови docker-compose.yml на сервере

**SSH в сервер**:
```bash
ssh -i ~/.ssh/your_ssh_key root@YOUR_SERVER_IP
```

**Обнови docker-compose.yml**:
```yaml
version: '3.8'

services:
  admin:
    image: giperpetr/your-project-admin:latest  # ИЗМЕНИ!
    container_name: admin
    restart: unless-stopped
    ports:
      - "3010:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 3s
      retries: 3

  customer-app:
    image: giperpetr/your-project-app:latest  # ИЗМЕНИ!
    container_name: customer-app
    restart: unless-stopped
    ports:
      - "4010:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

## ШАГ 8: Первый деплой!

```bash
# Экспортируй Docker Hub токен
export DOCKER_PASSWORD=dckr_pat_YOUR_TOKEN_HERE

# Запусти деплой
./scripts/deploy-dockerhub.sh
```

---

## 🔍 ПРОВЕРКА И ДИАГНОСТИКА

### Проверка после деплоя:

```bash
# На сервере
ssh root@YOUR_SERVER_IP

# Проверь статус контейнеров
docker ps

# Проверь логи
docker logs admin
docker logs customer-app

# Проверь образы
docker images | grep your-project
```

### Типичные ошибки и решения:

#### ❌ Error: "operation not permitted" при сборке
**Причина**: Docker сканирует .git директорию
**Решение**: Создай `.dockerignore` файлы (ШАГ 2)

#### ❌ Error: "default.conf: not found"
**Причина**: Неправильные пути в Dockerfile
**Решение**: Используй полные пути `COPY apps/admin/default.conf ...`

#### ❌ Error: "no matching manifest for linux/amd64"
**Причина**: Образ собран только для arm64 (Mac)
**Решение**: Используй `--platform linux/amd64,linux/arm64` в buildx

#### ❌ Error: "docker-compose: command not found"
**Причина**: Сервер использует Docker Compose v2
**Решение**: Используй `docker compose` (с пробелом), не `docker-compose`

#### ❌ Склады/данные не загружаются
**Причина**: Неправильная схема БД в Supabase клиенте
**Решение**: Проверь ШАГ 5 - используй специфичные клиенты (`inventoryAPI`, `salesAPI` и т.д.)

---

## 📌 ВАЖНЫЕ ДЕТАЛИ, КОТОРЫЕ НЕЛЬЗЯ УПУСТИТЬ

### 1. Multi-platform сборка

**Обязательно** используй `--platform linux/amd64,linux/arm64`:
- `linux/amd64` - для production сервера
- `linux/arm64` - для локальной разработки на Mac

### 2. Build context

Для monorepo build context = корень (`.`):
```bash
docker buildx build -f apps/admin/Dockerfile .
#                                           ^ корень!
```

### 3. Схемы БД в Supabase

Если у тебя несколько схем (`app`, `inventory`, `sales`):
- Создай отдельный клиент для каждой схемы
- **НИКОГДА** не используй дефолтный `supabase` клиент для таблиц не из схемы `app`

### 4. Переменные окружения в Docker

Vite требует переменные **во время сборки**:
```dockerfile
ARG VITE_SUPABASE_URL=...
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
RUN npm run build  # Vite использует ENV переменные здесь!
```

### 5. SSH ключи

Проверь, что SSH ключ имеет правильные права:
```bash
chmod 600 ~/.ssh/your_deploy_key
```

Если нужна passphrase:
```bash
ssh-add -K ~/.ssh/your_deploy_key  # на Mac
```

### 6. Docker Hub лимиты

**200 pulls за 6 часов** для бесплатного аккаунта.
Если превысишь - получишь ошибку `429 Too Many Requests`.

**Решение**: используй теги с git SHA вместо `latest` для кэширования:
```bash
docker.io/giperpetr/your-project:3e4845a  # git SHA
```

---

## 🎯 ЧЕКЛИСТ ПЕРЕД МИГРАЦИЕЙ

- [ ] Отключены GitHub Actions (.yml → .yml.disabled)
- [ ] Созданы .dockerignore файлы во всех приложениях
- [ ] Исправлены Dockerfile с полными путями и ARG/ENV
- [ ] Обновлены .env файлы с правильными Supabase ключами
- [ ] Проверены все Supabase клиенты (правильные схемы)
- [ ] Создан scripts/deploy-dockerhub.sh (настроен под проект)
- [ ] Обновлён docker-compose.yml на сервере
- [ ] Получен Docker Hub access token
- [ ] Проверен SSH доступ к серверу
- [ ] Первый тестовый деплой успешен

---

## 💾 BACKUP ПЕРЕД МИГРАЦИЕЙ

```bash
# Сделай backup текущих workflows
cp -r .github/workflows .github/workflows.backup

# Сделай backup docker-compose.yml на сервере
ssh root@YOUR_SERVER_IP "cp /root/your-project/docker-compose.yml /root/your-project/docker-compose.yml.backup"
```

---

## 📞 ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК

1. **Проверь логи Docker Build**:
   ```bash
   docker buildx build ... 2>&1 | tee build.log
   ```

2. **Проверь логи контейнера**:
   ```bash
   ssh root@SERVER "docker logs your-container-name"
   ```

3. **Откати изменения на сервере**:
   ```bash
   ssh root@SERVER "cd /root/your-project && docker compose down && cp docker-compose.yml.backup docker-compose.yml && docker compose up -d"
   ```

4. **Проверь переменные окружения**:
   ```bash
   # В контейнере
   docker exec -it your-container env | grep VITE
   ```

---

## 🚀 ПОСЛЕ УСПЕШНОЙ МИГРАЦИИ

1. Удали старые GitHub Container Registry образы
2. Обнови документацию проекта
3. Добавь эту инструкцию в README.md
4. Настрой CI/CD для других проектов по этой же схеме

---

## 📚 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Логин в Docker Hub
echo "TOKEN" | docker login -u username --password-stdin

# Проверка multi-platform образа
docker buildx imagetools inspect docker.io/username/image:latest

# Проверка слоёв образа
docker history docker.io/username/image:latest

# Проверка размера образов
docker images | grep your-project

# Очистка старых образов
docker image prune -a

# Проверка docker compose на сервере
ssh root@SERVER "docker compose version"
```

---

**Автор**: Claude (на основе миграции проекта Kholopye)
**Дата**: 2025-10-24
**Версия**: 1.0
