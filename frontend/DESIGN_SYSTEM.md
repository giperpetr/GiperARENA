# ArenaHUB Design System 🎮

## Обзор

Design System для ArenaHUB - это централизованная система дизайна в **космической игровой тематике** с неоновыми акцентами, минималистичным подходом и быстрой работой.

## 🎨 Философия дизайна

- **Минимализм** - Никакой перегруженности
- **Космическая тема** - Темно-серый неоднородный бархатный фон
- **Неоновые эффекты** - Голубые и фиолетовые акценты
- **Производительность** - Легкие анимации, быстрая загрузка
- **Современность** - Следование трендам 2025 года
- **Темная тема** - Единственная и основная тема

## 📁 Структура файлов

```
frontend/
├── tailwind.config.ts          # Конфигурация Tailwind с кастомной темой
├── src/
│   ├── app/
│   │   ├── globals.css         # CSS variables и utility классы
│   │   ├── layout.tsx          # Root layout со шрифтом Exo 2
│   │   ├── page.tsx            # Главная страница
│   │   └── design-system/      # Страница документации Design System
│   │       └── page.tsx
│   ├── components/
│   │   └── ui/                 # UI компоненты
│   │       ├── button.tsx      # Кнопки с вариантами
│   │       └── card.tsx        # Карточки с glow эффектом
│   └── lib/
│       └── utils.ts            # Utility функции
```

## 🎨 Цветовая палитра

### Primary - Cyan (Основной)
- **Использование**: Кнопки, ссылки, акценты, активные состояния
- **Цвет**: `#0ea5e9` (HSL: 199 89% 48%)
- **Классы**: `bg-primary`, `text-primary`, `border-primary`

### Secondary - Purple (Вторичный)
- **Использование**: Второстепенные элементы, hover состояния
- **Цвет**: `#a855f7` (HSL: 271 81% 56%)
- **Классы**: `bg-secondary`, `text-secondary`, `border-secondary`

### Neon Colors (Неоновые акценты)
```css
--neon-cyan: #00f0ff      /* Яркий cyan для эффектов */
--neon-purple: #bf00ff    /* Яркий purple для свечения */
--neon-pink: #ff00e5      /* Pink для акцентов */
--neon-blue: #0066ff      /* Blue для деталей */
```

### Space Grays (Космические серые)
```css
--space-black: #0a0a0f         /* Самый темный фон */
--space-dark-gray: #15151f     /* Темно-серый */
--space-medium-gray: #1f1f2e   /* Средний серый */
--space-light-gray: #2a2a3e    /* Светло-серый */
--space-border-gray: #3a3a4e   /* Цвет границ */
```

## 🔤 Типографика

### Основной шрифт: Exo 2
```typescript
// Подключается в layout.tsx
import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-exo-2',
});
```

### Размеры текста
| Класс | Размер | Применение |
|-------|--------|------------|
| `text-xs` | 12px | Мелкие надписи, badges |
| `text-sm` | 14px | Вторичный текст |
| `text-base` | 16px | Основной текст |
| `text-lg` | 18px | Увеличенный текст |
| `text-xl` | 20px | Подзаголовки |
| `text-2xl` | 24px | Заголовки H4 |
| `text-3xl` | 30px | Заголовки H3 |
| `text-4xl` | 36px | Заголовки H2 |
| `text-5xl` | 48px | Заголовки H1 |

## 📏 Spacing (Отступы)

Система отступов от 2px до 128px:

```
0.5 = 2px   | 1 = 4px   | 2 = 8px   | 3 = 12px
4 = 16px    | 6 = 24px  | 8 = 32px  | 12 = 48px
16 = 64px   | 24 = 96px | 32 = 128px
```

**Как менять**: В `tailwind.config.ts` в разделе `theme.extend.spacing`

## 🎭 UI Компоненты

### Button (Кнопки)

**Варианты**:
- `default` - Основная кнопка с cyan цветом и glow эффектом
- `secondary` - Вторичная кнопка с purple цветом
- `neon` - Градиентная кнопка с неоновым свечением
- `glass` - Полупрозрачная кнопка с эффектом стекла
- `outline` - Кнопка с обводкой
- `ghost` - Прозрачная кнопка
- `link` - Кнопка-ссылка
- `destructive` - Для удаления/опасных действий

**Размеры**: `sm`, `default`, `lg`, `xl`, `icon`

**Пример**:
```tsx
<Button variant="neon" size="lg">
  Начать играть
</Button>
```

### Card (Карточки)

**Особенности**:
- Полупрозрачный фон с backdrop-blur
- `glow` prop для эффекта свечения при наведении
- `hover-lift` для подъема при наведении

**Пример**:
```tsx
<Card glow className="hover-lift">
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>Содержимое</CardContent>
</Card>
```

## ✨ Эффекты

### Glass Morphism (Матовое стекло)
```tsx
<div className="glass">
  {/* Полупрозрачный фон с размытием */}
</div>

<div className="glass-hover">
  {/* С эффектом при наведении */}
</div>
```

### Glow Effects (Неоновое свечение)
```tsx
<div className="shadow-glow-cyan">Cyan glow</div>
<div className="shadow-glow-purple">Purple glow</div>
<div className="shadow-glow-pink">Pink glow</div>
<div className="shadow-glow-blue">Blue glow</div>
```

### Text Gradients (Градиентный текст)
```tsx
<h1 className="text-gradient-cyan-purple">
  Градиент от cyan к purple
</h1>

<h1 className="text-gradient-neon">
  Неоновый радужный градиент
</h1>
```

### Card Glow (Свечение карточки при наведении)
```tsx
<div className="card-glow">
  {/* Эффект следования за курсором */}
</div>
```

### Neon Borders (Неоновые обводки)
```tsx
<div className="neon-border">Cyan border с glow</div>
<div className="neon-border-purple">Purple border с glow</div>
```

### Grid Background (Сетка на фоне)
```tsx
<div className="grid-bg">
  {/* Фон с сеткой */}
</div>
```

### Animated Gradient (Анимированный градиент)
```tsx
<div className="animated-gradient">
  {/* Плавная анимация градиента */}
</div>
```

## 🎯 Как использовать Design System

### 1. Изменение цветов

Все цвета задаются через CSS variables в `globals.css`:

```css
:root {
  --primary: 199 89% 48%;    /* Cyan */
  --secondary: 271 81% 56%;  /* Purple */
  --background: 222 47% 5%;  /* Space black */
  /* ... */
}
```

**Чтобы изменить основной цвет**:
1. Открой `frontend/src/app/globals.css`
2. Измени значение `--primary`
3. Все компоненты автоматически обновятся

### 2. Изменение spacing (отступов)

В `tailwind.config.ts` в разделе `theme.extend.spacing`:

```ts
spacing: {
  '4': '1rem',  // Измени на '1.5rem' для увеличения
}
```

### 3. Изменение шрифта

В `tailwind.config.ts` в разделе `theme.extend.fontFamily`:

```ts
fontFamily: {
  sans: ['var(--font-exo-2)', 'system-ui', 'sans-serif'],
}
```

### 4. Добавление новых цветов

В `tailwind.config.ts`:

```ts
colors: {
  // Добавь новый цвет
  'my-color': {
    DEFAULT: '#ff0000',
    50: '#ffe5e5',
    // ...
  }
}
```

Используй: `bg-my-color`, `text-my-color`, `border-my-color`

### 5. Создание новых эффектов

В `globals.css` в разделе `@layer utilities`:

```css
.my-custom-effect {
  @apply bg-primary/10 backdrop-blur-md;
}
```

## 📱 Responsive Design

Все компоненты адаптивные. Используй Tailwind breakpoints:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  {/* sm: mobile, md: tablet, lg: desktop */}
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

## 🚀 Запуск

```bash
cd frontend
npm install
npm run dev
```

Открой:
- http://localhost:3000 - Главная страница
- http://localhost:3000/design-system - **Документация Design System**

## 📚 Ресурсы

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Next.js 15**: https://nextjs.org/docs

## 💡 Best Practices

1. **Используй существующие классы** - Не создавай новые CSS, если можно использовать Tailwind
2. **Компонентный подход** - Создавай переиспользуемые компоненты в `components/ui/`
3. **Темная тема всегда** - Все цвета оптимизированы для dark mode
4. **Минимум анимаций** - Только легкие transition и hover эффекты
5. **Accessibility** - Используй семантичный HTML и ARIA атрибуты

## 🎨 Примеры комбинаций

### Hero Section
```tsx
<div className="animated-gradient min-h-screen flex items-center justify-center">
  <h1 className="text-gradient-cyan-purple text-6xl font-bold">
    ArenaHUB
  </h1>
</div>
```

### Feature Card
```tsx
<Card glow className="hover-lift glass">
  <CardHeader>
    <div className="text-4xl mb-4">🤖</div>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="neon">Действие</Button>
  </CardContent>
</Card>
```

### Stats Counter
```tsx
<div className="grid grid-cols-3 gap-6">
  <Card glow className="glass">
    <CardTitle className="text-3xl text-primary">1,234</CardTitle>
    <CardDescription>Игроков</CardDescription>
  </Card>
</div>
```

---

**Design System v1.0** - ArenaHUB Space Gaming Theme 🚀

Создано с любовью к минимализму и космосу ✨
