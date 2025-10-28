# 🚀 НАДЁЖНЫЙ ДЕПЛОЙ GiperARENA

## 📋 ГЛАВНАЯ ПРОБЛЕМА И РЕШЕНИЕ

### Проблема (62+ попытки деплоя):
- **Docker кэширование** - сервер получал старые образы даже с тегом `:latest`
- **Production build Next.js 14** падал с onClick handler errors  
- **Отсутствие версионирования** образов

### Решение:
✅ **SHA версионирование** - каждый образ имеет уникальный тег  
✅ **--no-cache** при сборке - принудительная пересборка  
✅ **--force-recreate** при запуске - принудительное пересоздание контейнеров  
✅ **Dev mode в production** - Next.js dev server вместо production build

---

## 🎯 БЫСТРЫЙ СТАРТ

### Автоматический деплой (рекомендуется):
\`\`\`bash
cd /Users/giperpetr/Documents/Programming/ArenaHUB
chmod +x scripts/deploy-reliable.sh
./scripts/deploy-reliable.sh
\`\`\`

---

## 📝 ЧТО ДЕЛАЕТ scripts/deploy-reliable.sh

1. **Git коммит** - сохраняет изменения и получает SHA версию
2. **Docker Hub login** - авторизация для push образов
3. **Сборка frontend** - с флагом \`--no-cache\` и SHA тегом
4. **Сборка backend** - аналогично
5. **Загрузка конфигов** - docker-compose.prod.yml и .env на сервер
6. **Деплой на сервер**:
   - Удаление старых образов
   - Pull новых образов с \`--no-cache\`
   - Пересоздание контейнеров с \`--force-recreate\`
7. **Верификация** - проверка HTTP кода сайта

---

## ⚠️ ВАЖНЫЕ ПРАВИЛА

### ✅ ВСЕГДА делай:
1. **Git commit перед деплоем** - для SHA версионирования
2. **--no-cache** при сборке образов - избегай старого кэша
3. **docker rmi** старых образов на сервере - принудительное обновление
4. **--force-recreate** при запуске - пересоздание контейнеров
5. **Проверяй логи** после деплоя - убедись что нет ошибок

### ❌ НИКОГДА не делай:
1. Деплой без git commit - потеряешь версионирование
2. Использование только тега \`:latest\` - Docker кэш подставит старый образ
3. \`docker compose up -d\` без \`--force-recreate\` - может использовать старый контейнер
4. Деплой без проверки логов - можешь не заметить ошибки

---

## 🐛 TROUBLESHOOTING

### Проблема: Сервер показывает старую версию
**Решение:**
\`\`\`bash
ssh root@83.222.20.168
cd /root/giperarena
docker rmi giperpetr/giperarena-frontend:latest -f
docker compose -f docker-compose.prod.yml pull --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
\`\`\`

### Проблема: onClick handler errors в логах
**Причина:** Next.js production build не поддерживает event handlers в Server Components  
**Решение:** Используем dev mode (уже настроено в Dockerfile)  
**Проверка:** В Dockerfile должно быть \`CMD ["sh", "-c", "npx pnpm@10.19.0 run dev"]\`

---

**Последнее обновление:** 24 октября 2025  
**Версия:** 1.0 (после 62 попыток деплоя)
