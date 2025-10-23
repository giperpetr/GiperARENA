# ArenaHUB Frontend 🎮

Next.js 15 приложение с космической игровой темой и полноценным Design System.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Открой браузер
# http://localhost:3000 - Главная страница
# http://localhost:3000/design-system - Design System документация
```

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (Exo 2 font)
│   │   ├── page.tsx            # Главная страница
│   │   ├── globals.css         # CSS variables + utility классы
│   │   └── design-system/      # Документация Design System
│   │       └── page.tsx
│   ├── components/
│   │   └── ui/                 # UI компоненты
│   │       ├── button.tsx      # 8 вариантов кнопок
│   │       └── card.tsx        # Карточки с glow эффектом
│   └── lib/
│       └── utils.ts            # Utility функции
├── tailwind.config.ts          # Tailwind конфигурация
├── DESIGN_SYSTEM.md            # 📚 Полная документация
└── package.json
```

## 🎨 Design System

Полная документация в [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

### Ключевые особенности:

✨ **Космическая игровая тема**
- Темно-серый неоднородный бархатный фон
- Неоновые cyan/purple акценты
- Минимализм без перегруза

🎯 **Централизованное управление**
- Все цвета через CSS variables
- Изменения в одном месте = изменения везде
- Tailwind CSS кастомная конфигурация

⚡ **Производительность**
- Легкие анимации
- Оптимизированные эффекты
- Быстрая загрузка

🔤 **Типографика**
- Шрифт: Exo 2 (все веса)
- Полная поддержка кириллицы
- Адаптивные размеры

### Быстрый просмотр:

**Цвета**:
- Primary: Cyan `#0ea5e9`
- Secondary: Purple `#a855f7`
- Neon: Яркие акценты для эффектов

**Компоненты**:
- Button (8 вариантов)
- Card (с glow эффектом)
- Glass morphism
- Neon borders

**Эффекты**:
- Text gradients
- Glow shadows
- Animated backgrounds
- Hover lifts

## 🎯 Как менять дизайн

### 1. Изменить основной цвет

```css
/* В src/app/globals.css */
:root {
  --primary: 199 89% 48%;  /* Измени это значение */
}
```

### 2. Изменить spacing

```ts
// В tailwind.config.ts
spacing: {
  '4': '1rem',  // Измени на '1.5rem'
}
```

### 3. Добавить новый цвет

```ts
// В tailwind.config.ts
colors: {
  'my-color': '#ff0000',
}
```

Используй: `bg-my-color`, `text-my-color`

### 4. Создать новый эффект

```css
/* В globals.css в @layer utilities */
.my-effect {
  @apply bg-primary/10 backdrop-blur-md;
}
```

## 🧩 Доступные компоненты

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="neon" size="lg">
  Текст
</Button>
```

**Варианты**: default, secondary, neon, glass, outline, ghost, link, destructive
**Размеры**: sm, default, lg, xl, icon

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card glow className="hover-lift">
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>Содержимое</CardContent>
</Card>
```

## 🎨 Utility классы

```tsx
// Text gradients
<h1 className="text-gradient-cyan-purple">Текст</h1>
<h1 className="text-gradient-neon">Текст</h1>

// Glass morphism
<div className="glass">Контент</div>
<div className="glass-hover">Контент</div>

// Glow effects
<div className="shadow-glow-cyan">Контент</div>
<div className="neon-border">Контент</div>

// Backgrounds
<div className="grid-bg">Контент</div>
<div className="animated-gradient">Контент</div>

// Hover effects
<div className="hover-lift">Контент</div>
<div className="card-glow">Контент</div>
```

## 📱 Responsive

Все адаптивное из коробки. Используй Tailwind breakpoints:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Адаптивный текст
</div>
```

## 🛠️ Технологии

- **Next.js 15** - React framework с App Router
- **React 19** - Последняя версия React
- **TypeScript** - Типизация
- **Tailwind CSS 4** - Utility-first CSS
- **Exo 2** - Google Font (космический шрифт)
- **Radix UI** - Headless UI компоненты
- **class-variance-authority** - Варианты компонентов
- **tailwind-merge** - Объединение классов

## 📚 Полезные ссылки

- [Design System Docs](./DESIGN_SYSTEM.md) - Полная документация
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js 15](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🎯 Страницы

### Основные страницы:
- `/` - Главная страница с hero и features
- `/design-system` - **Интерактивная документация Design System**
- `/arenas` - Список арен с фильтрами
- `/arenas/[id]` - Детальная страница арены с WebRTC видео
- `/tournaments` - Список турниров
- `/tournaments/[id]` - Детальная страница турнира с турнирной сеткой
- `/marketplace` - NFT маркетплейс с фильтрами
- `/leaderboard` - Таблица лидеров с рейтингом игроков
- `/profile` - Профиль пользователя
- `/wallet` - Управление кошельком и стейкинг
- `/settings` - Настройки аккаунта (4 вкладки)

### Аутентификация:
- `/auth/login` - Вход в систему
- `/auth/register` - Регистрация нового пользователя

### Системные страницы:
- `/loading` - Страница загрузки (автоматическая)
- `/error` - Страница ошибки (автоматическая)
- `/not-found` - 404 страница

## 💡 Tips

1. **Всегда используй существующие компоненты** - Проверь `/design-system` перед созданием нового
2. **CSS variables для цветов** - Не используй hex коды напрямую
3. **Tailwind классы > custom CSS** - Используй Tailwind где возможно
4. **Минимум анимаций** - Только легкие transitions
5. **Dark theme only** - Все оптимизировано для темной темы

## 🚀 Production

```bash
# Build
npm run build

# Start
npm start
```

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

---

**ArenaHUB Frontend v1.0** 🎮
Космическая игровая платформа с минималистичным дизайном
