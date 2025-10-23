'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data
const MOCK_ARENA = {
  id: '1',
  name: 'Tokyo Cyber Arena',
  location: 'Tokyo, Japan',
  country: 'Japan',
  city: 'Tokyo',
  game_type: 'drone_racing',
  status: 'active',
  rating: 4.8,
  total_sessions: 1234,
  hourly_rate: 50,
  pricing_model: 'hourly',
  description:
    'Футуристическая арена в самом сердце Токио. Оснащена последними технологиями для гонок дронов с препятствиями и ультра-низкой задержкой передачи данных.',
  features: ['4K камеры', 'WebRTC <50ms', '5G connectivity', 'Препятствия', 'Ночной режим'],
  operator: {
    name: 'Tech Gaming Inc.',
    verified: true,
  },
  devices: [
    { id: '1', name: 'Drone Alpha', status: 'available', image: '🚁' },
    { id: '2', name: 'Drone Beta', status: 'in_use', image: '🚁' },
    { id: '3', name: 'Drone Gamma', status: 'available', image: '🚁' },
  ],
};

const RECENT_SESSIONS = [
  { player: 'Player123', score: 9850, time: '2m 45s', timestamp: '5 минут назад' },
  { player: 'DroneKing', score: 9720, time: '2m 52s', timestamp: '12 минут назад' },
  { player: 'SkyMaster', score: 9650, time: '2m 58s', timestamp: '28 минут назад' },
];

export default function ArenaDetailPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Arena Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/arenas" className="hover:text-primary transition-colors">
              Арены
            </Link>
            <span>/</span>
            <span>{MOCK_ARENA.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gradient-cyan-purple">
                  {MOCK_ARENA.name}
                </h1>
                {MOCK_ARENA.operator.verified && (
                  <Badge variant="success">✓ Верифицирована</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{MOCK_ARENA.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-bold text-foreground">{MOCK_ARENA.rating}</span>
                  <span>({MOCK_ARENA.total_sessions} игр)</span>
                </div>
                <Badge variant={MOCK_ARENA.status === 'active' ? 'success' : 'warning'}>
                  {MOCK_ARENA.status === 'active' ? 'Активна' : 'Обслуживание'}
                </Badge>
              </div>

              <p className="text-muted-foreground max-w-2xl">{MOCK_ARENA.description}</p>
            </div>

            <div className="glass rounded-lg p-6 lg:min-w-[280px]">
              <p className="text-sm text-muted-foreground mb-2">Цена за час</p>
              <p className="text-3xl font-bold text-primary mb-4">{MOCK_ARENA.hourly_rate} PAC</p>
              <Button variant="neon" size="lg" className="w-full" disabled={isPlaying}>
                {isPlaying ? 'В игре...' : 'Начать играть'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Stream */}
            <Card glow>
              <CardHeader>
                <CardTitle>Видео трансляция</CardTitle>
                <CardDescription>
                  WebRTC прямая трансляция с задержкой {'<'}50ms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-space-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Mock video stream */}
                  <div className="grid-bg absolute inset-0 opacity-20" />
                  <div className="animated-gradient absolute inset-0 opacity-10" />

                  {!isPlaying ? (
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4">🎮</div>
                      <p className="text-muted-foreground mb-4">Видео появится после старта игры</p>
                      <Button
                        variant="neon"
                        size="lg"
                        onClick={() => setIsPlaying(true)}
                      >
                        Начать игру
                      </Button>
                    </div>
                  ) : (
                    <div className="relative z-10 text-center">
                      <div className="animate-pulse text-6xl mb-4">🚁</div>
                      <p className="text-xl font-bold mb-2">Игра началась!</p>
                      <p className="text-muted-foreground mb-4">
                        Управляйте дроном с помощью клавиатуры
                      </p>
                      <div className="flex justify-center gap-4">
                        <Badge variant="neon">Latency: 42ms</Badge>
                        <Badge variant="success">FPS: 60</Badge>
                      </div>
                    </div>
                  )}

                  {/* Live indicator */}
                  {isPlaying && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 glass rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold">LIVE</span>
                    </div>
                  )}

                  {/* Stats overlay */}
                  {isPlaying && (
                    <div className="absolute bottom-4 right-4 space-y-2">
                      <div className="glass rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">Счёт</p>
                        <p className="text-xl font-bold text-neon-cyan">9,234</p>
                      </div>
                    </div>
                  )}
                </div>

                {isPlaying && (
                  <div className="mt-4 flex justify-center">
                    <Button variant="destructive" onClick={() => setIsPlaying(false)}>
                      Завершить игру
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card glow>
              <CardHeader>
                <CardTitle>Особенности арены</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {MOCK_ARENA.features.map((feature) => (
                    <Badge key={feature} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card glow>
              <CardHeader>
                <CardTitle>Недавние игры</CardTitle>
                <CardDescription>Топ результаты за последний час</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RECENT_SESSIONS.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg glass hover-lift"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{session.player}</p>
                          <p className="text-xs text-muted-foreground">{session.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{session.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Devices */}
            <Card glow>
              <CardHeader>
                <CardTitle>Доступные устройства</CardTitle>
                <CardDescription>{MOCK_ARENA.devices.length} дронов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_ARENA.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg glass">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{device.image}</div>
                      <div>
                        <p className="font-semibold">{device.name}</p>
                        <Badge
                          variant={device.status === 'available' ? 'success' : 'warning'}
                          className="text-xs mt-1"
                        >
                          {device.status === 'available' ? 'Доступен' : 'Занят'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Operator Info */}
            <Card glow>
              <CardHeader>
                <CardTitle>Оператор</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏢</div>
                  <div>
                    <p className="font-semibold">{MOCK_ARENA.operator.name}</p>
                    {MOCK_ARENA.operator.verified && (
                      <Badge variant="success" className="text-xs mt-1">
                        ✓ Верифицирован
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card glow>
              <CardHeader>
                <CardTitle>Правила</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Максимальное время сессии: 30 минут</p>
                <p>• Минимальный депозит: 50 PAC</p>
                <p>• Возврат средств при технических проблемах</p>
                <p>• Запрещено использование читов и эксплойтов</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
