# Next.js onClick Production Build Fix

**Дата создания:** 26 октября 2025  
**Проблема:** Next.js 15 production build падает с onClick handler errors  
**Статус:** Решено (частично)

---

## 🐛 Проблема

### Симптомы
- Next.js 15 production build падает с ошибками onClick handlers
- Кнопки не работают в production режиме
- Ошибки в логах: "onClick handler errors"
- Приложение работает в dev режиме, но не в production

### Причина
Next.js 15 с React 19 имеет проблемы с event handlers в Server Components при production build. Это связано с изменениями в React 19 и новой архитектуре Next.js 15.

---

## ✅ Решение

### 1. Использование Dev Mode в Production (Текущее)
**Статус:** Работает, но не оптимально

```dockerfile
# Dockerfile
FROM node:20-alpine AS runtime
# ... build stages ...

# Используем dev mode в production для исправления onClick проблем
CMD ["sh", "-c", "npx pnpm@10.19.0 run dev"]
```

**Плюсы:**
- ✅ Быстрое решение
- ✅ Все кнопки работают
- ✅ Hot reload доступен

**Минусы:**
- ❌ Не оптимально для production
- ❌ Больший размер bundle
- ❌ Медленнее чем production build

### 2. Webpack Configuration Fix
**Статус:** Частично реализовано

```javascript
// next.config.js
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

### 3. Client Component Optimization
**Статус:** Рекомендуется

```typescript
// Используйте 'use client' для компонентов с event handlers
'use client';

import { useState } from 'react';

export function Button({ onClick, children }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

---

## 🔧 Альтернативные решения

### 1. Downgrade to Next.js 14
**Статус:** Не рекомендуется

```bash
npm install next@14 react@18 react-dom@18
```

**Плюсы:**
- ✅ Стабильная версия
- ✅ onClick handlers работают

**Минусы:**
- ❌ Устаревшие features
- ❌ Нет React 19 features
- ❌ Потенциальные security issues

### 2. Custom Webpack Configuration
**Статус:** Экспериментально

```javascript
// next.config.js
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Production client-side optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### 3. Server Actions вместо onClick
**Статус:** Рекомендуется для форм

```typescript
// app/actions/arena.ts
'use server';

export async function createArena(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  
  // Server-side logic
  const arena = await db.arenas.create({ name, type });
  return arena;
}

// app/arenas/new/page.tsx
export default function NewArenaPage() {
  return (
    <form action={createArena}>
      <input name="name" placeholder="Arena name" />
      <select name="type">
        <option value="robot_race">Robot Race</option>
        <option value="drone_race">Drone Race</option>
      </select>
      <button type="submit">Create Arena</button>
    </form>
  );
}
```

---

## 🎯 Рекомендуемый подход

### Для критических компонентов
1. **Используйте 'use client'** для всех компонентов с event handlers
2. **Оптимизируйте bundle size** через dynamic imports
3. **Тестируйте в production** перед деплоем

```typescript
// Оптимизированный компонент
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});

export function OptimizedButton({ onClick, children }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onClick?.();
    } catch (error) {
      console.error('Button click error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onClick, isLoading]);

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

### Для форм
1. **Используйте Server Actions** вместо client-side обработки
2. **Валидация на сервере** для безопасности
3. **Optimistic updates** для UX

```typescript
// Server Action с валидацией
'use server';

import { z } from 'zod';

const CreateArenaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['robot_race', 'drone_race', 'robot_battle']),
});

export async function createArena(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
  };

  const result = CreateArenaSchema.safeParse(rawData);
  
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  try {
    const arena = await db.arenas.create(result.data);
    return { success: true, arena };
  } catch (error) {
    return { error: 'Failed to create arena' };
  }
}
```

---

## 🧪 Тестирование

### Unit Tests
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button onClick={() => {}} loading>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### E2E Tests
```typescript
// e2e/arena-creation.spec.ts
import { test, expect } from '@playwright/test';

test('should create arena', async ({ page }) => {
  await page.goto('/arenas/new');
  
  await page.fill('[name="name"]', 'Test Arena');
  await page.selectOption('[name="type"]', 'robot_race');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/arenas');
  await expect(page.locator('text=Test Arena')).toBeVisible();
});
```

---

## 📊 Мониторинг

### Error Tracking
```typescript
// utils/error-tracking.ts
export function trackError(error: Error, context: string) {
  console.error(`[${context}]`, error);
  
  // Send to monitoring service
  if (typeof window !== 'undefined') {
    // Client-side error tracking
    window.gtag?.('event', 'exception', {
      description: error.message,
      fatal: false,
    });
  }
}
```

### Performance Monitoring
```typescript
// utils/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
}
```

---

## 🚀 Деплой

### Production Build Test
```bash
# Локальное тестирование production build
npm run build
npm run start

# Проверка что все кнопки работают
npm run test:e2e
```

### Docker Build
```dockerfile
# Dockerfile с production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Используем production build
CMD ["npm", "start"]
```

---

## 📋 Checklist

### Перед деплоем
- [ ] Все компоненты с onClick имеют 'use client'
- [ ] Тесты проходят в production build
- [ ] E2E тесты проверяют все кнопки
- [ ] Bundle size в пределах нормы
- [ ] Performance метрики приемлемы

### После деплоя
- [ ] Сайт загружается без ошибок
- [ ] Все кнопки работают
- [ ] Нет ошибок в консоли
- [ ] Performance метрики хорошие
- [ ] Мониторинг настроен

---

## 🔄 Обновления

### Next.js 15.1+ (когда выйдет)
- Возможны исправления onClick проблем
- Обновить до стабильной версии
- Протестировать production build

### React 19.1+ (когда выйдет)
- Возможны исправления event handlers
- Обновить до стабильной версии
- Протестировать совместимость

---

**Последнее обновление:** 26 октября 2025  
**Статус:** Частично решено (dev mode в production)  
**Следующий обзор:** 2 ноября 2025
