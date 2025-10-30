'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

interface ArenaDetailClientProps {
  arena: any; // Real API structure - flexible typing for now
}

// Helper functions for time formatting
function formatDuration(seconds: number): string {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} минут назад`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : 'часов'} назад`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? 'день' : 'дней'} назад`;
}

export default function ArenaDetailClient({ arena }: ArenaDetailClientProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch recent sessions from API
  const { data: recentSessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', 'arena', arena.id],
    queryFn: async () => {
      const response = await api.getGameSessions({
        arena_id: arena.id,
        status: 'completed',
        limit: 3,
      });
      return response;
    },
    enabled: !!arena.id,
  });

  // Calculate hourly rate from price_per_minute
  const hourlyRate = arena.price_per_minute
    ? (parseFloat(arena.price_per_minute) * 60).toFixed(0)
    : '0';

  return (
    <>
      {/* Start Game Button in Header */}
      <div className="glass rounded-lg p-6 lg:min-w-[280px]">
        <p className="text-sm text-muted-foreground mb-2">Цена за час</p>
        <p className="text-3xl font-bold text-primary mb-4">{hourlyRate} {arena.currency || 'PAC'}</p>
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
                  {(arena.metadata?.features || arena.features || []).map((feature: string) => (
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
                  {sessionsLoading ? (
                    // Loading skeleton
                    <>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg glass animate-pulse"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-24 bg-muted rounded"></div>
                              <div className="h-3 w-16 bg-muted rounded"></div>
                            </div>
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="h-4 w-16 bg-muted rounded ml-auto"></div>
                            <div className="h-3 w-12 bg-muted rounded ml-auto"></div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : !recentSessionsData || recentSessionsData.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2">🎮</div>
                      <p>Недавних игр пока нет</p>
                    </div>
                  ) : (
                    // Display sessions
                    recentSessionsData.map((session: any, index: number) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg glass hover-lift"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {session.users?.username || session.player_username || `Player ${session.player_id.slice(0, 6)}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(session.end_time || session.updated_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {(session.score || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(session.duration_seconds || 0)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Devices - Only show if devices data exists */}
            {arena.devices && arena.devices.length > 0 && (
              <Card glow>
                <CardHeader>
                  <CardTitle>Доступные устройства</CardTitle>
                  <CardDescription>{arena.devices.length} дронов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {arena.devices.map((device: any) => (
                    <div key={device.id} className="flex items-center justify-between p-3 rounded-lg glass">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{device.image || '🚁'}</div>
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
            )}

            {/* Operator Info - Only show if operator data exists */}
            {arena.operator && (
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
            )}

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
