import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
        {/* Animated background */}
        <div className="animated-gradient absolute inset-0 -z-10" />
        <div className="grid-bg absolute inset-0 -z-10 opacity-30" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-block">
            <div className="animate-pulse-slow rounded-full bg-primary/10 p-4">
              <div className="text-6xl">🎮</div>
            </div>
          </div>

          <h1 className="mb-6 text-7xl font-bold">
            <span className="text-gradient-cyan-purple">ArenaHUB</span>
          </h1>

          <p className="mb-12 text-2xl text-muted-foreground">
            Управляй реальными роботами и дронами в физических аренах
            <br />
            <span className="text-primary">из любой точки мира</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" variant="neon">
              🚀 Начать играть
            </Button>
            <Button size="xl" variant="glass" asChild>
              <Link href="/design-system">📚 Design System</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">1,234</CardTitle>
                <CardDescription>Активных игроков</CardDescription>
              </CardHeader>
            </Card>
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-secondary">156</CardTitle>
                <CardDescription>Арен по всему миру</CardDescription>
              </CardHeader>
            </Card>
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-neon-cyan">$2.5M</CardTitle>
                <CardDescription>Призовой фонд</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold">
              <span className="text-gradient-neon">Особенности платформы</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Технологии будущего доступны уже сегодня
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">🤖</div>
                <CardTitle>Реальные устройства</CardTitle>
                <CardDescription>
                  Управляй настоящими роботами, дронами и машинами в реальном времени
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    WebRTC
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    {'<100ms'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">🏆</div>
                <CardTitle>Турниры</CardTitle>
                <CardDescription>
                  Участвуй в соревнованиях и выигрывай реальные призы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">
                    Single Elimination
                  </span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">
                    Round Robin
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">🎲</div>
                <CardTitle>Ставки</CardTitle>
                <CardDescription>
                  Делай ставки на игры и зарабатывай на прогнозах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan">
                    Live Betting
                  </span>
                  <span className="rounded-full bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan">
                    Low Fees
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">🖼️</div>
                <CardTitle>NFT маркетплейс</CardTitle>
                <CardDescription>
                  Покупай и продавай уникальные игровые NFT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neon-purple/10 px-3 py-1 text-xs text-neon-purple">
                    Solana
                  </span>
                  <span className="rounded-full bg-neon-purple/10 px-3 py-1 text-xs text-neon-purple">
                    5% Fee
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">💰</div>
                <CardTitle>Токеномика</CardTitle>
                <CardDescription>
                  GAC и PAC токены для управления и игры
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neon-pink/10 px-3 py-1 text-xs text-neon-pink">
                    Staking
                  </span>
                  <span className="rounded-full bg-neon-pink/10 px-3 py-1 text-xs text-neon-pink">
                    Rewards
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 text-4xl">🌍</div>
                <CardTitle>Глобальная сеть</CardTitle>
                <CardDescription>
                  Арены в разных странах и городах мира
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neon-blue/10 px-3 py-1 text-xs text-neon-blue">
                    Worldwide
                  </span>
                  <span className="rounded-full bg-neon-blue/10 px-3 py-1 text-xs text-neon-blue">
                    24/7
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Card glow className="glass text-center">
            <CardHeader>
              <CardTitle className="text-4xl">
                <span className="text-gradient-cyan-purple">Готов начать?</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Присоединяйся к тысячам игроков по всему миру
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="xl" variant="neon">
                  🎮 Создать аккаунт
                </Button>
                <Button size="xl" variant="outline">
                  📖 Узнать больше
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Бесплатная регистрация • Без скрытых платежей • Мгновенный старт
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>© 2025 ArenaHUB. Все права защищены.</p>
          <p className="mt-2">
            Создано с использованием{' '}
            <Link href="/design-system" className="text-primary hover:underline">
              Design System
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
