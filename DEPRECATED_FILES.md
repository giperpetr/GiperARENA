# 🗑️ УСТАРЕВШИЕ ФАЙЛЫ И СКРИПТЫ

**Создано:** 28 октября 2025
**Цель:** Список всех устаревших файлов для очистки проекта

---

## 📋 СКРИПТЫ ДЕПЛОЯ (УСТАРЕВШИЕ)

### ❌ Удалить или отметить как deprecated:

| Файл | Причина | Замена |
|------|---------|--------|
| `scripts/deploy-reliable.sh` | Монолитный скрипт, требует DOCKER_HUB_TOKEN | `scripts/deploy.sh` (модульный) |
| `scripts/deploy-dockerhub.sh` | Старый multi-platform build | `scripts/deploy.sh` |
| `server-deploy.sh` | Старая схема без SHA тегов | `scripts/deploy.sh` |
| `deploy-webhook.sh` | Для webhook, не актуален | Не используется |
| `frontend/scripts/deploy.sh` | Дубликат | `scripts/deploy.sh` |
| `frontend/scripts/build-amd64.sh` | Дубликат | `scripts/build-amd64.sh` |
| `frontend/scripts/deploy-to-server.sh` | Дубликат | `scripts/deploy-to-server.sh` |
| `frontend/scripts/update-compose.sh` | Дубликат | `scripts/update-compose.sh` |

---

## 📄 ДОКУМЕНТАЦИЯ (УСТАРЕВШАЯ)

### ⚠️ Обновить или удалить:

| Файл | Проблема | Действие |
|------|----------|----------|
| `DEPLOYMENT.md` | Устаревшая информация (24 октября) | Заменить на DEPLOYMENT_WORKING.md |
| `memory-bank/solutions/deployment_plan.md` | Старая схема деплоя | Обновить или удалить |
| `memory-bank/solutions/docker_deployment_reliable.md` | Описывает deploy-reliable.sh (устарел) | Обновить на новую модульную схему |
| `memory-bank/plan_mode_deployment.md` | Старая архитектура | Обновить |

---

## 🧹 РЕКОМЕНДАЦИИ ПО ОЧИСТКЕ

### 1. Переместить в архив (`archive/` директория):

```bash
mkdir -p archive/old-deploy-scripts
mv scripts/deploy-reliable.sh archive/old-deploy-scripts/
mv scripts/deploy-dockerhub.sh archive/old-deploy-scripts/
mv server-deploy.sh archive/old-deploy-scripts/
mv deploy-webhook.sh archive/old-deploy-scripts/
mv DEPLOYMENT.md archive/old-deploy-scripts/DEPLOYMENT-OLD.md
```

### 2. Удалить дубликаты:

```bash
rm -rf frontend/scripts/
# Причина: Все скрипты дублируются в scripts/
```

### 3. Обновить документацию в memory-bank:

```bash
# Обновить эти файлы с актуальной информацией:
memory-bank/solutions/deployment_plan.md
memory-bank/solutions/docker_deployment_reliable.md
memory-bank/plan_mode_deployment.md
```

---

## ✅ АКТУАЛЬНЫЕ ФАЙЛЫ (ИСПОЛЬЗОВАТЬ)

### Скрипты деплоя:

- ✅ `scripts/deploy.sh` (27 октября 14:08) - Главный скрипт
- ✅ `scripts/build-amd64.sh` (27 октября 14:08)
- ✅ `scripts/deploy-to-server.sh` (27 октября 13:46)
- ✅ `scripts/update-compose.sh` (27 октября 13:46)

### Документация:

- ✅ `DEPLOYMENT_WORKING.md` (28 октября) - Полная рабочая схема
- ✅ `CLAUDE.md` (обновлён 28 октября) - Главные инструкции
- ✅ `docker-compose.prod.yml` (актуальная версия с SHA)
- ✅ `frontend/Dockerfile` (production версия)

### Конфигурация:

- ✅ `.env` (на сервере)
- ✅ `package.json` + `pnpm-workspace.yaml`
- ✅ `frontend/tsconfig.json`
- ✅ `frontend/next.config.js`
- ✅ `frontend/tailwind.config.ts`

---

## 🔍 НАЙДЕННЫЕ ИЗМЕНЕНИЯ ЗА 2 ДНЯ

### Git коммиты:

```
c8a7c3f (27 окт) - Fix production build and deployment system ✅ РАБОТАЕТ
f0b41d8 (27 окт) - Fix Dockerfile for proper production build
855ffc7 (27 окт) - Fix tsconfig.json by copying from /tmp
6dc9c4f (27 окт) - Make tsconfig.json read-only
3ca139c (26 окт) - Fix Dockerfile CMD syntax
```

### Ключевые изменения:

1. **Создана модульная система деплоя** (4 скрипта вместо монолитного)
2. **Упрощён Dockerfile** (удалено 55 строк)
3. **Исправлен tailwind.config** (ts вместо js)
4. **SHA версионирование** образов Docker
5. **NODE_ENV=development** в production (решение onClick errors)

---

## 📊 СТАТИСТИКА

### Устаревшие файлы:

- **Скрипты деплоя:** 8 файлов
- **Документация:** 4 файла
- **Итого:** 12 файлов для очистки

### Актуальные файлы:

- **Скрипты деплоя:** 4 файла ✅
- **Документация:** 4 файла ✅
- **Конфигурация:** 6 файлов ✅

---

## 🎯 ПЛАН ДЕЙСТВИЙ

### Шаг 1: Создать архив (РЕКОМЕНДУЕТСЯ)

```bash
mkdir -p archive/2025-10-24-old-deploy-system
mv scripts/deploy-reliable.sh archive/2025-10-24-old-deploy-system/
mv scripts/deploy-dockerhub.sh archive/2025-10-24-old-deploy-system/
mv server-deploy.sh archive/2025-10-24-old-deploy-system/
mv deploy-webhook.sh archive/2025-10-24-old-deploy-system/
mv DEPLOYMENT.md archive/2025-10-24-old-deploy-system/DEPLOYMENT-OLD.md
```

### Шаг 2: Удалить дубликаты

```bash
rm -rf frontend/scripts/
```

### Шаг 3: Коммит изменений

```bash
git add -A
git commit -m "chore: archive old deployment scripts and documentation

- Archive deploy-reliable.sh, deploy-dockerhub.sh, server-deploy.sh
- Remove duplicate scripts from frontend/scripts/
- Add DEPLOYMENT_WORKING.md with current working deployment scheme
- Update CLAUDE.md with latest deployment instructions
- Tag: v1.0.0-successful-deploy"

git tag v1.0.0-cleanup -m "Cleanup old deployment files"
git push origin master --tags
```

---

**Автор:** GiperArena Team
**Дата:** 28 октября 2025
**Цель:** Очистка проекта от устаревших файлов
