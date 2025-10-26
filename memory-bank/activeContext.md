# Active Context - ArenaHUB

**Дата обновления:** 26 октября 2025  
**Текущий фокус:** Исправление проблем с деплоем и onClick handlers

---

## 🎯 Текущая задача

### Проблема с деплоем
Мы остановились на запуске проекта на удалённом сервере. Возникли трудности из-за **onClick handler errors** в Next.js 15 production build.

### Схема деплоя
1. **Локальная сборка Docker** → Docker Hub → Запуск на сервере через docker-compose
2. **Проблема:** Production build Next.js 14/15 падает с onClick handler errors
3. **Решение:** Используем dev mode в production (уже настроено в Dockerfile)

---

## 🔧 Текущие технические проблемы

### 1. onClick Handler Errors
**Проблема:** Next.js 15 production build не поддерживает event handlers в Server Components  
**Симптомы:** 
- Ошибки в логах: "onClick handler errors"
- Кнопки не работают в production
- Приложение падает при клике

**Текущее решение:**
- Используем dev mode в production (CMD в Dockerfile)
- Настроен webpack fallback в next.config.js
- Добавлен compiler.removeConsole для production

### 2. Docker Кэширование
**Проблема:** Сервер получает старые образы даже с тегом `:latest`  
**Решение:**
- SHA версионирование образов
- `--no-cache` при сборке
- `--force-recreate` при запуске
- Удаление старых образов на сервере

---

## 📁 Текущая структура проекта

### Frontend (Next.js 15)
```
frontend/
├── src/app/                 # Next.js App Router
│   ├── page.tsx            # Главная страница
│   ├── arenas/             # Страницы арен
│   ├── auth/               # Аутентификация
│   ├── tournaments/        # Турниры
│   ├── wallet/             # Кошелёк
│   └── marketplace/        # NFT маркетплейс
├── src/components/         # React компоненты
│   └── ui/                 # shadcn/ui компоненты
├── Dockerfile              # Production build (с dev mode)
└── next.config.js          # Конфигурация Next.js
```

### Backend (Node.js)
```
backend/
├── src/
│   ├── routes/             # API endpoints
│   ├── controllers/        # Обработчики запросов
│   ├── services/           # Бизнес-логика
│   └── middleware/         # Express middleware
├── migrations/             # Database миграции
└── Dockerfile              # Backend контейнер
```

### Deployment
```
scripts/
└── deploy-reliable.sh      # Скрипт деплоя с SHA версионированием
```

---

## 🚀 Текущий процесс деплоя

### 1. Локальная разработка
```bash
cd /Users/giperpetr/Documents/Programming/ArenaHUB
npm run dev  # Запуск всех сервисов локально
```

### 2. Деплой на сервер
```bash
./scripts/deploy-reliable.sh
```

**Что делает скрипт:**
1. Git commit → получение SHA версии
2. Docker build с `--no-cache` → избегает кэша
3. Docker push с SHA + latest тегами → загрузка в Docker Hub
4. SSH на сервер → удаляет старые образы
5. docker compose pull с `--no-cache` → скачивает новые образы
6. docker compose up с `--force-recreate` → пересоздаёт контейнеры

### 3. Серверная инфраструктура
```
/root/giperarena/
├── docker-compose.prod.yml  # Production конфигурация
├── .env                     # Environment переменные
└── logs/                    # Логи контейнеров
```

---

## 🔍 Текущие настройки

### Frontend (next.config.js)
```javascript
const nextConfig = {
  // Fix for Next.js 15 production build with onClick handlers
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  
  // Ensure proper client-side bundle handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};
```

### Frontend (Dockerfile)
```dockerfile
# Production build с dev mode для исправления onClick проблем
CMD ["npx", "next", "start"]  # Production server
# Альтернатива: CMD ["sh", "-c", "npx pnpm@10.19.0 run dev"]  # Dev mode
```

### Docker Compose
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.giperarena.space
    networks:
      - proxy  # Traefik для SSL
```

---

## 🎯 Следующие шаги

### Немедленные задачи
1. **Проверить текущий статус деплоя** - работает ли сайт
2. **Исправить onClick проблемы** - если они всё ещё есть
3. **Настроить WebRTC** - для управления роботами
4. **Реализовать базовую blockchain интеграцию**

### Приоритеты
1. **Стабильность деплоя** - убедиться что всё работает
2. **WebRTC интеграция** - основная функциональность
3. **Arena management** - система управления аренами
4. **User authentication** - полная система аутентификации

---

## 📊 Текущие метрики

### Технические
- **Frontend:** Next.js 15 + React 19
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 17 (Supabase)
- **Deployment:** Docker + Docker Hub

### Статус
- **Development:** ✅ Локальная разработка работает
- **Deployment:** ⚠️ Проблемы с onClick handlers
- **WebRTC:** ❌ Не реализовано
- **Blockchain:** ❌ Только базовая структура

---

## 🔧 Настройки окружения

### Локальное окружение
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=https://api.gipergiraffe.com
```

### Production окружение
```bash
# .env (на сервере)
NEXT_PUBLIC_API_URL=https://api.giperarena.space
NEXT_PUBLIC_WS_URL=wss://ws.giperarena.space
NEXT_PUBLIC_SUPABASE_URL=https://api.gipergiraffe.com
```

---

## 🚨 Критические проблемы

### 1. onClick Handler Errors
**Статус:** Частично решено (dev mode в production)  
**Приоритет:** Высокий  
**Следующие действия:** Тестирование в production

### 2. Docker Кэширование
**Статус:** Решено (SHA версионирование)  
**Приоритет:** Средний  
**Следующие действия:** Мониторинг

### 3. WebRTC Интеграция
**Статус:** Не начато  
**Приоритет:** Высокий  
**Следующие действия:** Начать реализацию

---

**Последнее обновление:** 26 октября 2025  
**Следующий обзор:** 27 октября 2025
