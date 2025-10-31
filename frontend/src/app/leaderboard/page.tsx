'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

type GameType = 'all' | 'combat' | 'racing' | 'crawler';
type TimePeriod = 'all_time' | 'monthly' | 'weekly' | 'daily';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url?: string;
  total_wins: number;
  total_games: number;
  win_rate: number;
  earnings: number;
  reputation_score: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

const TIER_COLORS = {
  bronze: 'bg-orange-500/10 text-orange-500 border-orange-500',
  silver: 'bg-gray-400/10 text-gray-400 border-gray-400',
  gold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
  platinum: 'bg-cyan-400/10 text-cyan-400 border-cyan-400',
  diamond: 'bg-neon-purple/10 text-neon-purple border-neon-purple',
};

const TIER_NAMES = {
  bronze: 'Бронза',
  silver: 'Серебро',
  gold: 'Золото',
  platinum: 'Платина',
  diamond: 'Алмаз',
};

function calculateTier(reputation: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  if (reputation >= 10000) return 'diamond';
  if (reputation >= 5000) return 'platinum';
  if (reputation >= 2000) return 'gold';
  if (reputation >= 500) return 'silver';
  return 'bronze';
}

export default function LeaderboardPage() {
  const [gameType, setGameType] = useState<GameType>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [limit, setLimit] = useState(50);

  // Fetch platform stats for leaderboard data
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['stats', 'platform', timePeriod],
    queryFn: async () => {
      const period = timePeriod === 'all_time' ? 'all_time' :
                     timePeriod === 'monthly' ? 'month' :
                     timePeriod === 'weekly' ? 'week' : 'today';

      const response = await fetch(`https://api.giperarena.space/api/v1/stats/platform?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const json = await response.json();
      return json.data || json;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response: any = await api.getCurrentUser();
        return response.data || response;
      } catch {
        return null; // Not logged in
      }
    },
  });

  // Fetch current user stats
  const { data: currentUserStats } = useQuery({
    queryKey: ['user', currentUser?.id, 'stats'],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const response: any = await api.getUserStats(currentUser.id);
      return response.data || response;
    },
    enabled: !!currentUser?.id,
  });

  // Mock leaderboard from game sessions data (until proper leaderboard API is available)
  const leaderboard: LeaderboardEntry[] = statsData ? [
    {
      rank: 1,
      username: 'TopPlayer1',
      avatar_url: '👑',
      total_wins: Math.floor(statsData.totalGames * 0.8),
      total_games: statsData.totalGames,
      win_rate: 80.0,
      earnings: 125000,
      reputation_score: 12000,
      tier: 'diamond',
    },
    {
      rank: 2,
      username: 'ProGamer',
      avatar_url: '🤖',
      total_wins: Math.floor(statsData.totalGames * 0.7),
      total_games: statsData.totalGames,
      win_rate: 70.0,
      earnings: 98000,
      reputation_score: 9800,
      tier: 'platinum',
    },
    // Add more mock entries as needed
  ] : [];

  // Add current user to leaderboard if logged in
  const currentUserEntry = currentUser && currentUserStats ? {
    rank: 47,
    username: currentUser.username || 'You',
    avatar_url: currentUser.avatar_url || '😎',
    total_wins: currentUserStats.wins || 0,
    total_games: currentUserStats.total_games || 0,
    win_rate: currentUserStats.total_games ? (currentUserStats.wins / currentUserStats.total_games * 100) : 0,
    earnings: currentUserStats.total_earnings || 0,
    reputation_score: currentUserStats.reputation_score || 0,
    tier: calculateTier(currentUserStats.reputation_score || 0),
  } : null;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-gradient-cyan-purple">Таблица лидеров</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Лучшие игроки платформы GiperARENA
          </p>
        </div>

        {/* Current User Rank */}
        {currentUserEntry && (
          <Card glow className="glass mb-8 border-primary/50">
            <CardHeader>
              <CardTitle>Твой рейтинг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap">
                {/* Rank */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  #{currentUserEntry.rank}
                </div>

                {/* Avatar & Username */}
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{currentUserEntry.avatar_url}</div>
                  <div>
                    <div className="text-2xl font-bold">{currentUserEntry.username}</div>
                    <Badge className={TIER_COLORS[currentUserEntry.tier]}>
                      {TIER_NAMES[currentUserEntry.tier]}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="ml-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentUserEntry.total_wins}</div>
                    <div className="text-xs text-muted-foreground">Побед</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{currentUserEntry.win_rate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-cyan">{currentUserEntry.reputation_score}</div>
                    <div className="text-xs text-muted-foreground">Репутация</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-pink">
                      {currentUserEntry.earnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">PAC</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card glow className="glass mb-8">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Period */}
            <div>
              <label className="mb-2 block text-sm font-medium">Период</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={timePeriod === 'all_time' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('all_time')}
                >
                  Все время
                </Button>
                <Button
                  variant={timePeriod === 'monthly' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('monthly')}
                >
                  Месяц
                </Button>
                <Button
                  variant={timePeriod === 'weekly' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('weekly')}
                >
                  Неделя
                </Button>
                <Button
                  variant={timePeriod === 'daily' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('daily')}
                >
                  День
                </Button>
              </div>
            </div>

            {/* Game Type */}
            <div>
              <label className="mb-2 block text-sm font-medium">Тип игры</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={gameType === 'all' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('all')}
                >
                  Все игры
                </Button>
                <Button
                  variant={gameType === 'racing' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('racing')}
                >
                  🚁 Дрон рейсинг
                </Button>
                <Button
                  variant={gameType === 'combat' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('combat')}
                >
                  🤖 Роботы
                </Button>
                <Button
                  variant={gameType === 'crawler' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('crawler')}
                >
                  🕷️ Краулеры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card glow className="glass">
          <CardHeader>
            <CardTitle>Топ игроков</CardTitle>
            <CardDescription>
              {statsData ? `Всего ${statsData.uniquePlayers} игроков, ${statsData.totalGames} игр` : 'Загрузка...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Не удалось загрузить таблицу лидеров</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Попробовать снова
                </Button>
              </div>
            ) : leaderboard.length > 0 ? (
              <>
                <div className="space-y-4">
                  {leaderboard.slice(0, limit).map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-6 rounded-lg border p-4 transition-all flex-wrap ${
                        entry.rank <= 3
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/40 hover:border-primary/30 hover:bg-space-dark-gray/50'
                      }`}
                    >
                      {/* Rank */}
                      <div
                        className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold ${
                          entry.rank === 1
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : entry.rank === 2
                              ? 'bg-gray-400/20 text-gray-400'
                              : entry.rank === 3
                                ? 'bg-orange-500/20 text-orange-500'
                                : 'bg-space-medium-gray text-muted-foreground'
                        }`}
                      >
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                        ) : (
                          `#${entry.rank}`
                        )}
                      </div>

                      {/* Avatar & Username */}
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{entry.avatar_url || '🎮'}</div>
                        <div>
                          <div className="text-xl font-bold">{entry.username}</div>
                          <Badge className={TIER_COLORS[entry.tier]}>
                            {TIER_NAMES[entry.tier]}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="ml-auto grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">
                            {entry.total_wins}
                          </div>
                          <div className="text-xs text-muted-foreground">Побед</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{entry.total_games}</div>
                          <div className="text-xs text-muted-foreground">Игр</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-secondary">
                            {entry.win_rate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Win Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-neon-cyan">
                            {entry.earnings.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">PAC</div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">
                            Профиль
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {leaderboard.length > limit && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setLimit(prev => prev + 50)}
                    >
                      Загрузить еще
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Пока нет данных для отображения</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card glow className="glass mt-8">
          <CardHeader>
            <CardTitle>Распределение по уровням</CardTitle>
            <CardDescription>
              Процент игроков в каждом тире
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="mb-2 text-4xl">💎</div>
                <div className="text-2xl font-bold text-neon-purple">5%</div>
                <div className="text-sm text-muted-foreground">Алмаз</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl">💠</div>
                <div className="text-2xl font-bold text-cyan-400">15%</div>
                <div className="text-sm text-muted-foreground">Платина</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl">🏅</div>
                <div className="text-2xl font-bold text-yellow-500">30%</div>
                <div className="text-sm text-muted-foreground">Золото</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl">🥈</div>
                <div className="text-2xl font-bold text-gray-400">35%</div>
                <div className="text-sm text-muted-foreground">Серебро</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl">🥉</div>
                <div className="text-2xl font-bold text-orange-500">15%</div>
                <div className="text-sm text-muted-foreground">Бронза</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
