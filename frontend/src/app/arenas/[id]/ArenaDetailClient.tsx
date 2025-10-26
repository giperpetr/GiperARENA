'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArenaDetailClientProps {
  arena: {
    id: string;
    name: string;
    location: string;
    country: string;
    city: string;
    game_type: string;
    status: string;
    rating: number;
    total_sessions: number;
    hourly_rate: number;
    pricing_model: string;
    description: string;
    features: string[];
    operator: {
      name: string;
      verified: boolean;
    };
    devices: Array<{
      id: string;
      name: string;
      status: string;
      image: string;
    }>;
  };
  recentSessions: Array<{
    player: string;
    score: number;
    time: string;
    timestamp: string;
  }>;
}

export default function ArenaDetailClient({ arena, recentSessions }: ArenaDetailClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      {/* Start Game Button in Header */}
      <div className="glass rounded-lg p-6 lg:min-w-[280px]">
        <p className="text-sm text-muted-foreground mb-2">Цена за час</p>
        <p className="text-3xl font-bold text-primary mb-4">{arena.hourly_rate} PAC</p>
        <Button variant="neon" size="lg" className="w-full" disabled={isPlaying}>
          {isPlaying ? 'В игре...' : 'Начать играть'}
        </Button>
      </div>

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
                  {arena.features.map((feature) => (
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
                  {recentSessions.map((session, index) => (
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
                <CardDescription>{arena.devices.length} дронов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {arena.devices.map((device) => (
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
                    <p className="font-semibold">{arena.operator.name}</p>
                    {arena.operator.verified && (
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
    </>
  );
}
