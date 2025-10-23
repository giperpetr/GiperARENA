'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type GameType = 'all' | 'drone_racing' | 'robot_combat' | 'rc_cars';
type TimePeriod = 'all_time' | 'monthly' | 'weekly' | 'daily';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  total_wins: number;
  total_games: number;
  win_rate: number;
  earnings: number; // PAC tokens
  favorite_arena?: string;
  current_streak: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    username: 'DroneKing_Tokyo',
    avatar: '👑',
    total_wins: 1247,
    total_games: 1356,
    win_rate: 91.96,
    earnings: 125000,
    favorite_arena: 'Tokyo Cyber Arena',
    current_streak: 23,
    tier: 'diamond',
  },
  {
    rank: 2,
    username: 'RobotMaster_Berlin',
    avatar: '🤖',
    total_wins: 1156,
    total_games: 1298,
    win_rate: 89.06,
    earnings: 98500,
    favorite_arena: 'Berlin Battle Zone',
    current_streak: 15,
    tier: 'diamond',
  },
  {
    rank: 3,
    username: 'SkyRacer_Moscow',
    avatar: '🚁',
    total_wins: 1089,
    total_games: 1245,
    win_rate: 87.47,
    earnings: 87600,
    favorite_arena: 'Moscow Sky Arena',
    current_streak: 19,
    tier: 'diamond',
  },
  {
    rank: 4,
    username: 'CyberPilot_NY',
    avatar: '🎮',
    total_wins: 987,
    total_games: 1123,
    win_rate: 87.89,
    earnings: 76400,
    favorite_arena: 'New York Circuit',
    current_streak: 12,
    tier: 'platinum',
  },
  {
    rank: 5,
    username: 'NeonDriver_LA',
    avatar: '🏎️',
    total_wins: 945,
    total_games: 1098,
    win_rate: 86.07,
    earnings: 71200,
    favorite_arena: 'LA Speed Track',
    current_streak: 8,
    tier: 'platinum',
  },
  {
    rank: 6,
    username: 'ArenaChampion',
    avatar: '🏆',
    total_wins: 876,
    total_games: 1034,
    win_rate: 84.72,
    earnings: 65800,
    favorite_arena: 'Tokyo Cyber Arena',
    current_streak: 11,
    tier: 'platinum',
  },
  {
    rank: 7,
    username: 'ProGamer_Seoul',
    avatar: '⚡',
    total_wins: 834,
    total_games: 998,
    win_rate: 83.57,
    earnings: 58900,
    favorite_arena: 'Seoul Tech Arena',
    current_streak: 6,
    tier: 'gold',
  },
  {
    rank: 8,
    username: 'TechWizard',
    avatar: '🧙',
    total_wins: 789,
    total_games: 956,
    win_rate: 82.53,
    earnings: 52300,
    favorite_arena: 'Berlin Battle Zone',
    current_streak: 9,
    tier: 'gold',
  },
  {
    rank: 9,
    username: 'SpeedDemon_Paris',
    avatar: '😈',
    total_wins: 756,
    total_games: 923,
    win_rate: 81.91,
    earnings: 47800,
    favorite_arena: 'Paris Circuit',
    current_streak: 4,
    tier: 'gold',
  },
  {
    rank: 10,
    username: 'RacingLegend',
    avatar: '🌟',
    total_wins: 723,
    total_games: 891,
    win_rate: 81.14,
    earnings: 43500,
    favorite_arena: 'Moscow Sky Arena',
    current_streak: 7,
    tier: 'gold',
  },
  {
    rank: 11,
    username: 'QuantumRacer',
    avatar: '🔬',
    total_wins: 678,
    total_games: 845,
    win_rate: 80.24,
    earnings: 39200,
    favorite_arena: 'Tokyo Cyber Arena',
    current_streak: 5,
    tier: 'silver',
  },
  {
    rank: 12,
    username: 'NeonNinja',
    avatar: '🥷',
    total_wins: 645,
    total_games: 812,
    win_rate: 79.43,
    earnings: 35600,
    favorite_arena: 'Seoul Tech Arena',
    current_streak: 3,
    tier: 'silver',
  },
];

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

export default function LeaderboardPage() {
  const [gameType, setGameType] = useState<GameType>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all_time');
  const [selectedArena, setSelectedArena] = useState<string>('all');

  // Mock current user rank
  const currentUserRank = 47;
  const currentUser = {
    rank: currentUserRank,
    username: 'You',
    avatar: '😎',
    total_wins: 234,
    total_games: 312,
    win_rate: 75.0,
    earnings: 12400,
    favorite_arena: 'Tokyo Cyber Arena',
    current_streak: 2,
    tier: 'silver' as const,
  };

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-gradient-cyan-purple">Таблица лидеров</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Лучшие игроки платформы ArenaHUB
          </p>
        </div>

        {/* Current User Rank */}
        <Card glow className="glass mb-8 border-primary/50">
          <CardHeader>
            <CardTitle>Твой рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Rank */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                #{currentUser.rank}
              </div>

              {/* Avatar & Username */}
              <div className="flex items-center gap-4">
                <div className="text-5xl">{currentUser.avatar}</div>
                <div>
                  <div className="text-2xl font-bold">{currentUser.username}</div>
                  <Badge className={TIER_COLORS[currentUser.tier]}>
                    {TIER_NAMES[currentUser.tier]}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="ml-auto grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{currentUser.total_wins}</div>
                  <div className="text-xs text-muted-foreground">Побед</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{currentUser.win_rate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-cyan">{currentUser.current_streak}</div>
                  <div className="text-xs text-muted-foreground">Стрик</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-pink">
                    {currentUser.earnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">PAC</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  variant={gameType === 'drone_racing' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('drone_racing')}
                >
                  🚁 Дрон рейсинг
                </Button>
                <Button
                  variant={gameType === 'robot_combat' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('robot_combat')}
                >
                  🤖 Роботы
                </Button>
                <Button
                  variant={gameType === 'rc_cars' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setGameType('rc_cars')}
                >
                  🏎️ RC машины
                </Button>
              </div>
            </div>

            {/* Arena */}
            <div>
              <label className="mb-2 block text-sm font-medium">Арена</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedArena === 'all' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArena('all')}
                >
                  Все арены
                </Button>
                <Button
                  variant={selectedArena === 'tokyo' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArena('tokyo')}
                >
                  Tokyo Cyber Arena
                </Button>
                <Button
                  variant={selectedArena === 'berlin' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArena('berlin')}
                >
                  Berlin Battle Zone
                </Button>
                <Button
                  variant={selectedArena === 'moscow' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedArena('moscow')}
                >
                  Moscow Sky Arena
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
              Лучшие игроки по количеству побед и win rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-6 rounded-lg border p-4 transition-all ${
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
                    <div className="text-4xl">{entry.avatar}</div>
                    <div>
                      <div className="text-xl font-bold">{entry.username}</div>
                      <div className="flex gap-2">
                        <Badge className={TIER_COLORS[entry.tier]}>
                          {TIER_NAMES[entry.tier]}
                        </Badge>
                        {entry.current_streak > 0 && (
                          <Badge variant="outline">
                            🔥 {entry.current_streak} стрик
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="ml-auto grid grid-cols-5 gap-6 text-center">
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
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Загрузить еще
              </Button>
            </div>
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
            <div className="grid grid-cols-5 gap-4">
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
