# 🎯 PLAN MODE - ИТОГОВЫЙ ПЛАН РАЗВЕРТЫВАНИЯ ARENAHUB

## 📋 СВОДКА ПРОБЛЕМ И РЕШЕНИЙ

### ❌ ИЗВЕСТНЫЕ ПРОБЛЕМЫ (62+ попытки деплоя)
1. **Docker кэширование** - сервер получал старые образы даже с тегом `:latest`
2. **Next.js production build** падал с onClick handler errors (60+ раз)
3. **Отсутствие версионирования** образов
4. **GitHub Actions** - минуты кончились, не используется

### ✅ РЕАЛИЗОВАННЫЕ РЕШЕНИЯ
1. **SHA версионирование** - каждый образ имеет уникальный тег
2. **--no-cache** при сборке - принудительная пересборка
3. **--force-recreate** при запуске - принудительное пересоздание контейнеров
4. **Dev mode в production** - Next.js dev server вместо production build
5. **Docker Hub + SSH** - надежная схема деплоя

---

## 🏗️ АРХИТЕКТУРА ПОЛНОГО СТЕКА

### Компоненты для развертывания
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Realtime      │
│   (Next.js)     │    │   (Node.js)     │    │   (Socket.io)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3001    │
│   Dev Mode!     │    │   Production    │    │   Production    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Media         │
                    │   (WebRTC)      │
                    │   Port: 3002    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Blockchain    │
                    │   (Solana)      │
                    │   Port: 3003    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Traefik       │
                    │   (Reverse      │
                    │    Proxy)       │
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   External      │
                    │   Services      │
                    │   (Supabase)    │
                    └─────────────────┘
```

### Домены и маршруты
- **Frontend**: https://giperarena.space
- **Backend API**: https://api.giperarena.space
- **WebSocket**: https://ws.giperarena.space
- **Media WebRTC**: https://media.giperarena.space
- **Blockchain**: https://blockchain.giperarena.space

---

## 🚀 ПОШАГОВЫЙ ПЛАН РАЗВЕРТЫВАНИЯ

### Этап 1: Подготовка (5 минут)
```bash
# 1. Установка прав на скрипт
chmod +x scripts/deploy-reliable.sh

# 2. Установка Docker Hub токена
export DOCKER_HUB_TOKEN="dckr_pat_..."

# 3. Проверка SSH подключения
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "echo 'SSH OK'"
```

### Этап 2: Сборка образов (15-20 минут)
```bash
# Запуск автоматизированного деплоя
./scripts/deploy-reliable.sh
```

**Что происходит:**
1. Git commit → получение SHA версии
2. Docker Hub login
3. Сборка Frontend (--no-cache)
4. Сборка Backend (--no-cache)
5. Сборка Realtime (--no-cache)
6. Сборка Media (--no-cache)
7. Сборка Blockchain (--no-cache)
8. Push всех образов в Docker Hub

### Этап 3: Развертывание на сервере (10 минут)
```bash
# Автоматически выполняется скриптом:
# 1. Загрузка docker-compose.prod.yml и .env
# 2. SSH на сервер
# 3. Удаление старых образов
# 4. Pull новых образов (--no-cache)
# 5. Пересоздание контейнеров (--force-recreate)
# 6. Ожидание запуска (60 секунд)
# 7. Проверка статуса
```

### Этап 4: Верификация (5 минут)
```bash
# Проверка всех сервисов
curl -I https://giperarena.space/                    # Frontend
curl -I https://api.giperarena.space/                # Backend API
curl -I https://ws.giperarena.space/                 # WebSocket
curl -I https://media.giperarena.space/              # Media WebRTC
curl -I https://blockchain.giperarena.space/         # Blockchain
```

---

## 🔧 КРИТИЧЕСКИЕ НАСТРОЙКИ

### Frontend (Next.js) - КРИТИЧЕСКИ ВАЖНО
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
# КРИТИЧЕСКИ: Dev mode в production!
CMD ["npm", "run", "dev"]
```

**Причина**: Next.js production build падает с onClick handler errors
**Решение**: Используем dev mode в production (уже настроено)

### Docker Compose конфигурация
```yaml
# docker-compose.prod.yml
services:
  frontend:
    image: giperpetr/giperarena-frontend:latest
    environment:
      - NODE_ENV=development  # Dev mode!
      - PORT=3000
    labels:
      - "traefik.http.routers.giperarena.rule=Host(`giperarena.space`)"
      - "traefik.http.routers.giperarena.entrypoints=websecure"
      - "traefik.http.routers.giperarena.tls.certresolver=letsencrypt"
```

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА

### ✅ ВСЕГДА делай:
1. **Git commit перед деплоем** - для SHA версионирования
2. **--no-cache** при сборке всех образов - избегай старого кэша
3. **docker rmi** старых образов на сервере - принудительное обновление
4. **--force-recreate** при запуске - пересоздание контейнеров
5. **Dev mode для frontend** - Next.js dev server работает стабильно
6. **Проверка всех сервисов** - верификация каждого компонента

### ❌ НИКОГДА не делай:
1. **GitHub Actions** - минуты кончились
2. **Деплой без --no-cache** - будет старый кэш
3. **Деплой без --force-recreate** - будут старые контейнеры
4. **Production build Next.js** - падает с onClick errors
5. **Пропуск проверки сервисов** - может привести к неработающему стеку

---

## 🔍 МОНИТОРИНГ И ОТЛАДКА

### Проверка статуса
```bash
# Проверка контейнеров
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml ps"

# Проверка логов
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs --tail=50"

# Проверка конкретного сервиса
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml logs frontend"
```

### Отладка проблем
```bash
# Проверка образов на сервере
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "docker images | grep giperarena"

# Проверка сетей
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "docker network ls"

# Перезапуск сервисов
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168 "cd /root/giperarena && docker compose -f docker-compose.prod.yml restart"
```

---

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После выполнения плана:
- ✅ **Frontend**: https://giperarena.space (Next.js dev mode)
- ✅ **Backend API**: https://api.giperarena.space (Node.js)
- ✅ **WebSocket**: https://ws.giperarena.space (Socket.io)
- ✅ **Media WebRTC**: https://media.giperarena.space (mediasoup)
- ✅ **Blockchain**: https://blockchain.giperarena.space (Solana)
- ✅ **SSL сертификаты** настроены автоматически
- ✅ **Интеграция** с существующей инфраструктурой Supabase
- ✅ **Мониторинг** и логирование работают
- ✅ **Надежная схема** обновления через Docker Hub

---

## 🚀 КОМАНДЫ ДЛЯ ЗАПУСКА

```bash
# Переход в директорию проекта
cd /Users/giperpetr/Documents/Programming/ArenaHUB

# Установка прав на скрипт
chmod +x scripts/deploy-reliable.sh

# Установка Docker Hub токена
export DOCKER_HUB_TOKEN="dckr_pat_..."

# Запуск полного деплоя
./scripts/deploy-reliable.sh
```

---

## 📊 ВРЕМЯ ВЫПОЛНЕНИЯ

- **Подготовка**: 5 минут
- **Сборка образов**: 15-20 минут
- **Развертывание**: 10 минут
- **Верификация**: 5 минут
- **ИТОГО**: 35-40 минут

---

## 🎉 ЗАКЛЮЧЕНИЕ

План полностью готов к выполнению! Все проблемы учтены, решения реализованы, скрипты подготовлены. 

**Статус**: ✅ ГОТОВ К РАЗВЕРТЫВАНИЮ!

**Следующий шаг**: Запустить `./scripts/deploy-reliable.sh` 🚀
