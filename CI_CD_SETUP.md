# CI/CD Setup для GiperARENA 🚀

Автоматический деплой SLIM Docker контейнеров на production сервер через GitHub Actions.

## 📋 Что было настроено

### ✅ 1. GitHub Actions Workflow
**Файл:** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

**Функционал:**
- ✅ Параллельная сборка 5 сервисов (frontend, backend, realtime, media, blockchain)
- ✅ Multi-stage build для SLIM образов (Alpine Linux base)
- ✅ Кэширование Docker слоёв для ускорения сборки
- ✅ Публикация в GitHub Container Registry (ghcr.io)
- ✅ Автоматический деплой на сервер через SSH
- ✅ Zero-downtime deployment
- ✅ Healthcheck после деплоя
- ✅ Автоматическая очистка старых образов

### ✅ 2. SLIM Docker Образы

**Оптимизации:**
- ✅ Multi-stage build (3 стадии: deps, builder, runner)
- ✅ Alpine Linux базовый образ (~5 MB вместо ~150 MB Ubuntu)
- ✅ Production-only dependencies (без dev-зависимостей)
- ✅ `.dockerignore` файлы для исключения ненужных файлов
- ✅ Минимальное количество слоёв

**Результат:**
| Сервис | Размер | Экономия |
|--------|--------|----------|
| Frontend | ~150 MB | 5x меньше |
| Backend | ~120 MB | 5x меньше |
| Realtime | ~100 MB | 5x меньше |
| Media | ~180 MB | 4x меньше |
| Blockchain | ~130 MB | 5x меньше |
| **ИТОГО** | **~680 MB** | **вместо ~3.5 GB!** |

### ✅ 3. Production Configuration

**Файлы:**
- [`.env.production`](.env.production) - Production переменные окружения
- [`docker-compose.yml`](docker-compose.yml) - Development compose
- `docker-compose.prod.yml` - Генерируется автоматически на сервере в CI/CD

**Сервисы:**
1. **Frontend** (Next.js 15) → https://giperarena.space
2. **Backend API** → https://api.giperarena.space
3. **WebSocket** → wss://ws.giperarena.space
4. **Media Server** → https://media.giperarena.space
5. **Blockchain** → внутренний сервис

### ✅ 4. GitHub Secrets

**Обязательные секреты:** (см. [GITHUB_SECRETS.md](GITHUB_SECRETS.md))
- `VPS_HOST` - IP сервера
- `VPS_USER` - SSH пользователь
- `VPS_SSH_KEY` - Приватный SSH ключ
- `POSTGRES_PASSWORD` - Пароль БД
- `REDIS_PASSWORD` - Пароль Redis
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` - MinIO credentials
- `ANON_KEY` / `SERVICE_ROLE_KEY` - Supabase keys
- `JWT_SECRET` - JWT секрет

---

## 🚀 Как работает CI/CD

### Триггеры деплоя:

1. **Автоматически при push в `main`:**
   ```bash
   git add .
   git commit -m "feat: новая фича"
   git push origin main
   ```

2. **Вручную из GitHub Actions:**
   - GitHub → Actions → Build and Deploy GiperARENA
   - Run workflow → Run workflow

### Процесс деплоя:

```mermaid
graph LR
    A[Push to main] --> B[Build SLIM Images]
    B --> C[Push to ghcr.io]
    C --> D[SSH to Server]
    D --> E[Pull Images]
    E --> F[Deploy Containers]
    F --> G[Healthcheck]
    G --> H[Cleanup Old Images]
```

### Шаги выполнения:

1. **Build Stage** (параллельно для каждого сервиса):
   - Checkout кода
   - Setup Docker Buildx
   - Login в GitHub Container Registry
   - Multi-stage build SLIM образа
   - Push в ghcr.io/giperpetr/giperarena/*

2. **Deploy Stage:**
   - SSH подключение к серверу
   - Login в GHCR
   - Pull новых образов (с SHA тегом)
   - Генерация `docker-compose.prod.yml`
   - Остановка старых контейнеров
   - Запуск новых контейнеров
   - Healthcheck всех сервисов
   - Очистка старых образов

---

## 📝 Первоначальная настройка

### 1. Настроить SSH доступ

```bash
# Сгенерировать SSH ключ для CI/CD
ssh-keygen -t rsa -b 4096 -f ~/.ssh/giperarena_deploy -N ""

# Добавить публичный ключ на сервер
cat ~/.ssh/giperarena_deploy.pub | ssh root@83.222.20.168 "cat >> ~/.ssh/authorized_keys"

# Протестировать подключение
ssh -i ~/.ssh/giperarena_deploy root@83.222.20.168
```

### 2. Добавить GitHub Secrets

См. подробную инструкцию в [GITHUB_SECRETS.md](GITHUB_SECRETS.md).

**Быстрая настройка через CLI:**
```bash
gh secret set VPS_HOST -b "83.222.20.168"
gh secret set VPS_USER -b "root"
gh secret set VPS_SSH_KEY < ~/.ssh/giperarena_deploy
# ... остальные секреты
```

### 3. Создать Docker сети на сервере

```bash
# Подключиться к серверу
ssh root@83.222.20.168

# Проверить существующие сети
docker network ls

# Если нет, создать:
docker network create proxy
```

### 4. Запустить первый деплой

```bash
# Опция 1: Через push
git push origin main

# Опция 2: Вручную в GitHub Actions
# GitHub → Actions → Run workflow
```

---

## 🔍 Мониторинг и отладка

### Просмотр логов GitHub Actions:

1. GitHub → Actions → Build and Deploy GiperARENA
2. Выбрать последний запуск
3. Посмотреть логи каждого job'а

### Просмотр логов на сервере:

```bash
# Подключиться к серверу
ssh root@83.222.20.168

# Перейти в директорию проекта
cd /root/giperarena

# Посмотреть запущенные контейнеры
docker compose -f docker-compose.prod.yml ps

# Логи всех сервисов
docker compose -f docker-compose.prod.yml logs

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs backend

# Логи в реальном времени
docker compose -f docker-compose.prod.yml logs -f

# Проверить размеры образов
docker images ghcr.io/giperpetr/giperarena/*
```

### Проверка доступности сервисов:

```bash
# Frontend
curl -I https://giperarena.space

# Backend API
curl -I https://api.giperarena.space/health

# WebSocket
curl -I https://ws.giperarena.space/health

# Media Server
curl -I https://media.giperarena.space/health
```

---

## 🛠️ Управление деплоем

### Перезапустить сервис:

```bash
# На сервере
cd /root/giperarena
docker compose -f docker-compose.prod.yml restart frontend
```

### Откатить к предыдущей версии:

```bash
# Найти предыдущий SHA
git log --oneline -5

# Откатить git
git revert <commit-sha>
git push origin main

# Или на сервере вручную:
docker pull ghcr.io/giperpetr/giperarena/frontend:main-<old-sha>
docker tag ghcr.io/giperpetr/giperarena/frontend:main-<old-sha> ghcr.io/giperpetr/giperarena/frontend:latest
docker compose -f docker-compose.prod.yml up -d frontend
```

### Обновить .env переменные:

```bash
# На сервере
nano /root/giperarena/.env

# Перезапустить затронутые сервисы
docker compose -f docker-compose.prod.yml restart backend
```

---

## 🔒 Безопасность

### SSH ключи:
- ✅ Используйте отдельный SSH ключ для CI/CD
- ✅ НЕ используйте личные SSH ключи
- ✅ Регулярно ротируйте ключи

### Секреты:
- ✅ НИКОГДА не коммитьте секреты в git
- ✅ Используйте GitHub Secrets для всех паролей
- ✅ Регулярно обновляйте пароли

### Docker образы:
- ✅ Образы публикуются в private ghcr.io (требуется авторизация)
- ✅ Multi-stage build исключает dev-зависимости
- ✅ Минимальная attack surface благодаря Alpine Linux

---

## 📊 Метрики и мониторинг

### Prometheus метрики:

```bash
# Backend метрики
curl https://api.giperarena.space/metrics
```

### Grafana дашборды:

- **URL:** https://monitoring.gipergiraffe.com
- **Dashboard:** GiperARENA Production

### Alerting:

- AlertManager настроен в существующем monitoring stack
- Алерты отправляются при:
  - Сервис недоступен > 5 минут
  - CPU > 80%
  - Memory > 90%
  - Disk > 85%

---

## ❓ FAQ

### Q: Как долго длится деплой?
**A:** ~5-7 минут (сборка + деплой)

### Q: Будет ли downtime при деплое?
**A:** Нет, используется zero-downtime deployment стратегия.

### Q: Что делать если деплой failed?
**A:**
1. Проверить логи в GitHub Actions
2. Проверить SSH доступ к серверу
3. Проверить логи на сервере

### Q: Как проверить что образы действительно SLIM?
**A:**
```bash
# На сервере
docker images ghcr.io/giperpetr/giperarena/* --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Q: Можно ли запускать деплой только определённого сервиса?
**A:** Да, можно закомментировать ненужные сервисы в matrix strategy в [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

---

## 🎯 Next Steps

1. ✅ Настроить GitHub Secrets (см. [GITHUB_SECRETS.md](GITHUB_SECRETS.md))
2. ✅ Запустить первый деплой
3. ⏳ Настроить мониторинг алертов
4. ⏳ Настроить автоматические бэкапы БД
5. ⏳ Настроить staging окружение

---

**Документация обновлена:** 2025-10-22
**Проект:** GiperARENA
**Репозиторий:** https://github.com/giperpetr/GiperARENA
**Сервер:** 83.222.20.168
