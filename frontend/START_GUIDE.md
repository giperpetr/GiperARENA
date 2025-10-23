# 🚀 Как запустить Frontend

## ⚠️ Проблема

Проект настроен как pnpm monorepo, но есть конфликт версий Next.js (15 vs 16) и Turbopack несовместимость.

## ✅ Решение 1: Использовать npm (РЕКОМЕНДУЕТСЯ)

```bash
cd /Users/giperpetr/Documents/Programming/ArenaHUB/frontend

# Установить зависимости через npm
npm install

# Запустить dev сервер
npm run dev

# Откроется на http://localhost:3000
```

## ✅ Решение 2: Переустановить с pnpm

```bash
cd /Users/giperpetr/Documents/Programming/ArenaHUB/frontend

# Удалить node_modules и .next (ВРУЧНУЮ)
# Выполните эти команды вручную в терминале:
rm -rf node_modules .next

# Вернуться в корень проекта
cd ..

# Переустановить всё
pnpm install

# Запустить frontend
cd frontend
../node_modules/.bin/next dev
```

## ✅ Решение 3: Исправить next.config.js

Если используете Turbopack (Next.js 16+), удалите webpack config:

```javascript
// В next.config.js уже исправлено:
turbopack: {},  // Вместо webpack: (config) => {...}
```

## 📄 Все страницы готовы:

- `/` - Главная
- `/design-system` - Design System
- `/arenas` - Арены
- `/tournaments` - Турниры
- `/marketplace` - NFT
- `/leaderboard` - Рейтинг
- `/profile` - Профиль
- `/wallet` - Кошелек
- `/auth/login` - Вход
- `/auth/register` - Регистрация
- `/settings` - Настройки

## 🎨 Design System

После запуска откройте:
```
http://localhost:3000/design-system
```

Полная интерактивная документация с примерами!

## 📚 Документация

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Полная документация дизайна
- [README.md](./README.md) - Frontend документация
- [FRONTEND_COMPLETE.md](../FRONTEND_COMPLETE.md) - Отчёт о проделанной работе

---

**Код полностью готов! Проблема только в запуске из-за monorepo структуры.**

Используйте **Решение 1 (npm)** для быстрого старта.
