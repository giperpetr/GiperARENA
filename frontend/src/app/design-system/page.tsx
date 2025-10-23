'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-gradient-cyan-purple">GiperARENA Design System</h1>
          <p className="text-xl text-muted-foreground">
            Космическая игровая тема с неоновыми акцентами
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Цветовая палитра</h2>

          {/* Primary Colors - Cyan */}
          <Card glow>
            <CardHeader>
              <CardTitle>Primary (Cyan) - Основной цвет</CardTitle>
              <CardDescription>Используется для кнопок, ссылок, акцентов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className={`h-20 w-full rounded-lg bg-primary-${shade}`}
                      style={{
                        backgroundColor: `hsl(var(--primary))`,
                        opacity: shade / 1000,
                      }}
                    />
                    <p className="text-center text-xs">{shade}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secondary Colors - Purple */}
          <Card glow>
            <CardHeader>
              <CardTitle>Secondary (Purple) - Вторичный цвет</CardTitle>
              <CardDescription>Для второстепенных элементов и hover состояний</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className={`h-20 w-full rounded-lg bg-secondary-${shade}`}
                      style={{
                        backgroundColor: `hsl(var(--secondary))`,
                        opacity: shade / 1000,
                      }}
                    />
                    <p className="text-center text-xs">{shade}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Neon Colors */}
          <Card glow>
            <CardHeader>
              <CardTitle>Neon Colors - Неоновые акценты</CardTitle>
              <CardDescription>Для эффектов свечения и подсветки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-neon-cyan shadow-glow-cyan" />
                  <p className="text-center">Cyan #00f0ff</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-neon-purple shadow-glow-purple" />
                  <p className="text-center">Purple #bf00ff</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-neon-pink shadow-glow-pink" />
                  <p className="text-center">Pink #ff00e5</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-neon-blue shadow-glow-blue" />
                  <p className="text-center">Blue #0066ff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Space Grays */}
          <Card glow>
            <CardHeader>
              <CardTitle>Space Grays - Космические оттенки серого</CardTitle>
              <CardDescription>Фоновые цвета и поверхности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-space-black" />
                  <p className="text-center text-xs">Black #0a0a0f</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-space-dark-gray" />
                  <p className="text-center text-xs">Dark Gray #15151f</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-space-medium-gray" />
                  <p className="text-center text-xs">Medium Gray #1f1f2e</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-space-light-gray" />
                  <p className="text-center text-xs">Light Gray #2a2a3e</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-space-border-gray" />
                  <p className="text-center text-xs">Border Gray #3a3a4e</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Типографика</h2>

          <Card glow>
            <CardHeader>
              <CardTitle>Шрифт: Exo 2</CardTitle>
              <CardDescription>Футуристический шрифт для игровой платформы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h1>Heading 1 - 48px/60px</h1>
                <h2>Heading 2 - 36px/48px</h2>
                <h3>Heading 3 - 30px</h3>
                <h4>Heading 4 - 24px</h4>
                <h5>Heading 5 - 20px</h5>
                <h6>Heading 6 - 18px</h6>
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xl">Text XL - 20px</p>
                <p className="text-lg">Text LG - 18px</p>
                <p className="text-base">Text Base - 16px (default)</p>
                <p className="text-sm">Text SM - 14px</p>
                <p className="text-xs">Text XS - 12px</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Отступы</h2>

          <Card glow>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>Система отступов от 2px до 128px</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: '0.5', px: '2px', rem: '0.125rem' },
                  { name: '1', px: '4px', rem: '0.25rem' },
                  { name: '2', px: '8px', rem: '0.5rem' },
                  { name: '3', px: '12px', rem: '0.75rem' },
                  { name: '4', px: '16px', rem: '1rem' },
                  { name: '6', px: '24px', rem: '1.5rem' },
                  { name: '8', px: '32px', rem: '2rem' },
                  { name: '12', px: '48px', rem: '3rem' },
                  { name: '16', px: '64px', rem: '4rem' },
                  { name: '24', px: '96px', rem: '6rem' },
                  { name: '32', px: '128px', rem: '8rem' },
                ].map((spacing) => (
                  <div key={spacing.name} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-mono">{spacing.name}</div>
                    <div className="h-8 bg-primary rounded" style={{ width: spacing.px }} />
                    <div className="text-sm text-muted-foreground">
                      {spacing.px} / {spacing.rem}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Кнопки</h2>

          <Card glow>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Различные варианты кнопок</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="neon">Neon</Button>
                <Button variant="glass">Glass</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="mb-4 text-lg font-semibold">Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">🎮</Button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="mb-4 text-lg font-semibold">States</h4>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled</Button>
                  <Button loading>Loading</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Эффекты</h2>

          <Card glow>
            <CardHeader>
              <CardTitle>Shadows & Glows</CardTitle>
              <CardDescription>Неоновые эффекты свечения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="rounded-lg bg-card p-6 shadow-glow-cyan">
                    <p className="text-center">Cyan Glow</p>
                  </div>
                  <div className="rounded-lg bg-card p-6 shadow-glow-purple">
                    <p className="text-center">Purple Glow</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-card p-6 shadow-glow-pink">
                    <p className="text-center">Pink Glow</p>
                  </div>
                  <div className="rounded-lg bg-card p-6 shadow-glow-blue">
                    <p className="text-center">Blue Glow</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow>
            <CardHeader>
              <CardTitle>Glass Morphism</CardTitle>
              <CardDescription>Эффект матового стекла</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="glass relative min-h-[200px] rounded-lg p-6">
                <h3 className="mb-2 text-xl font-bold">Glass Effect</h3>
                <p className="text-muted-foreground">
                  Полупрозрачный фон с размытием для создания эффекта матового стекла
                </p>
              </div>
            </CardContent>
          </Card>

          <Card glow>
            <CardHeader>
              <CardTitle>Text Gradients</CardTitle>
              <CardDescription>Градиентный текст</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h2 className="text-gradient-cyan-purple">Cyan to Purple Gradient</h2>
              <h2 className="text-gradient-neon">Neon Rainbow Gradient</h2>
            </CardContent>
          </Card>
        </section>

        {/* Grid Pattern */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Паттерны</h2>

          <Card glow>
            <CardHeader>
              <CardTitle>Background Patterns</CardTitle>
              <CardDescription>Фоновые паттерны</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid-bg relative min-h-[200px] rounded-lg border border-border p-6">
                <h3 className="text-xl font-bold">Grid Pattern</h3>
                <p className="text-muted-foreground">Сетка для космического фона</p>
              </div>
            </CardContent>
          </Card>

          <Card glow>
            <CardHeader>
              <CardTitle>Animated Gradient</CardTitle>
              <CardDescription>Анимированный градиент</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animated-gradient relative min-h-[200px] rounded-lg p-6">
                <h3 className="text-xl font-bold">Animated Background</h3>
                <p className="text-muted-foreground">Плавная анимация градиента</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>ArenaHUB Design System v1.0 - Space Gaming Theme</p>
          <p className="mt-2">
            Используй классы Tailwind CSS для быстрого создания интерфейсов
          </p>
        </div>
      </div>
    </div>
  );
}
