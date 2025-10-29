'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrophyIcon,
  CoinsIcon,
  FireIcon,
  ArenaIcon,
  CalendarIcon,
  ClockIcon,
  StatsIcon,
  SettingsIcon,
  WalletIcon,
  StarIcon,
  ZapIcon,
  CrownIcon,
} from '@/components/ui/icons';

interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPlayTime: string;
  favoriteRobot: string;
  currentRank: string;
  rankPoints: number;
  achievements: number;
  totalEarnings: number;
}

interface Match {
  id: string;
  date: string;
  arenaName: string;
  robotType: string;
  result: 'win' | 'loss';
  score: string;
  earnings: number;
  duration: string;
  opponents: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

interface WalletBalance {
  gac: number;
  pac: number;
  usd: number;
}

const MOCK_STATS: PlayerStats = {
  gamesPlayed: 342,
  wins: 198,
  losses: 144,
  winRate: 57.89,
  totalPlayTime: '148 часов 23 минуты',
  favoriteRobot: 'Cyber Drone X-7',
  currentRank: 'Gold II',
  rankPoints: 2350,
  achievements: 47,
  totalEarnings: 12450,
};

const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    date: '2025-10-28 18:45',
    arenaName: 'Tokyo Cyber Arena',
    robotType: 'Drone',
    result: 'win',
    score: '3-1',
    earnings: 150,
    duration: '12:34',
    opponents: 3,
  },
  {
    id: '2',
    date: '2025-10-28 17:20',
    arenaName: 'Berlin Tech Hub',
    robotType: 'Combat Robot',
    result: 'loss',
    score: '1-2',
    earnings: 0,
    duration: '15:42',
    opponents: 1,
  },
  {
    id: '3',
    date: '2025-10-28 16:10',
    arenaName: 'Singapore Marina',
    robotType: 'RC Car',
    result: 'win',
    score: '2-0',
    earnings: 200,
    duration: '8:21',
    opponents: 2,
  },
  {
    id: '4',
    date: '2025-10-27 20:15',
    arenaName: 'New York Battle Arena',
    robotType: 'Combat Robot',
    result: 'win',
    score: '3-0',
    earnings: 300,
    duration: '18:56',
    opponents: 2,
  },
  {
    id: '5',
    date: '2025-10-27 19:00',
    arenaName: 'Moscow Speedway',
    robotType: 'Drone',
    result: 'loss',
    score: '0-2',
    earnings: 0,
    duration: '10:45',
    opponents: 1,
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Первая победа',
    description: 'Выиграйте ваш первый матч',
    icon: '🏆',
    rarity: 'common',
    unlockedAt: '2025-08-15',
  },
  {
    id: '2',
    title: 'Серия побед',
    description: 'Выиграйте 5 матчей подряд',
    icon: '🔥',
    rarity: 'rare',
    unlockedAt: '2025-09-02',
  },
  {
    id: '3',
    title: 'Мастер дронов',
    description: 'Выиграйте 50 матчей на дронах',
    icon: '🚁',
    rarity: 'epic',
    unlockedAt: '2025-10-10',
  },
  {
    id: '4',
    title: 'Легенда арены',
    description: 'Достигните ранга Gold',
    icon: '👑',
    rarity: 'legendary',
    unlockedAt: '2025-10-20',
  },
  {
    id: '5',
    title: 'Марафонец',
    description: 'Сыграйте 100 часов',
    icon: '⏱️',
    rarity: 'rare',
    unlockedAt: '2025-10-15',
  },
  {
    id: '6',
    title: 'Коллекционер',
    description: 'Разблокируйте 50 достижений',
    icon: '🎖️',
    rarity: 'epic',
    unlockedAt: 'В процессе',
    progress: 47,
    maxProgress: 50,
  },
];

const MOCK_WALLET: WalletBalance = {
  gac: 1250.5,
  pac: 8500,
  usd: 3425.75,
};

const RARITY_CONFIG = {
  common: { color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: 'Обычное' },
  rare: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Редкое' },
  epic: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Эпическое' },
  legendary: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Легендарное' },
};

export default function PlayerDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const stats = MOCK_STATS;
  const matches = MOCK_MATCHES;
  const achievements = MOCK_ACHIEVEMENTS;
  const wallet = MOCK_WALLET;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">
                <span className="text-gradient-cyan-purple">Профиль игрока</span>
              </h1>
              <p className="text-lg text-muted-foreground">Ваша статистика и достижения</p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/settings">
                <SettingsIcon size={20} className="mr-2" />
                Настройки
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card glow className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrophyIcon size={16} />
                Побед
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{stats.wins}</p>
                <p className="text-sm text-green-400">+{stats.winRate.toFixed(1)}%</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Из {stats.gamesPlayed} игр</p>
            </CardContent>
          </Card>

          <Card glow className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CrownIcon size={16} />
                Ранг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cyan-400">{stats.currentRank}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.rankPoints} очков</p>
            </CardContent>
          </Card>

          <Card glow className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <StarIcon size={16} />
                Достижения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-400">{stats.achievements}</p>
              <p className="text-xs text-muted-foreground mt-1">Разблокировано</p>
            </CardContent>
          </Card>

          <Card glow className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CoinsIcon size={16} />
                Заработано
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">{stats.totalEarnings} PAC</p>
              <p className="text-xs text-muted-foreground mt-1">За все время</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="matches">История игр</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="wallet">Кошелёк</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Stats Card */}
              <Card glow className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StatsIcon size={24} className="text-cyan-400" />
                    Общая статистика
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Всего игр</span>
                    <span className="font-bold text-white">{stats.gamesPlayed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Победы / Поражения</span>
                    <span className="font-bold text-white">
                      {stats.wins} / {stats.losses}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Винрейт</span>
                    <span className="font-bold text-green-400">{stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Время игры</span>
                    <span className="font-bold text-white">{stats.totalPlayTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Любимый робот</span>
                    <span className="font-bold text-cyan-400">{stats.favoriteRobot}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card glow className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StarIcon size={24} className="text-purple-400" />
                    Недавние достижения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.slice(0, 5).map((achievement) => {
                    const rarityConfig = RARITY_CONFIG[achievement.rarity];
                    return (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/5 hover:from-muted/30 hover:to-muted/10 transition-colors"
                      >
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{achievement.title}</p>
                            <Badge variant="outline" className={`${rarityConfig.bgColor} ${rarityConfig.color} text-xs`}>
                              {rarityConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full mt-2" onClick={() => setSelectedTab('achievements')}>
                    Посмотреть все достижения
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZapIcon size={24} className="text-yellow-400" />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="neon" className="w-full" asChild>
                  <Link href="/arenas">
                    <ArenaIcon size={18} className="mr-2" />
                    Найти арену
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tournaments">
                    <TrophyIcon size={18} className="mr-2" />
                    Турниры
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/leaderboard">
                    <CrownIcon size={18} className="mr-2" />
                    Рейтинг
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/settings">
                    <SettingsIcon size={18} className="mr-2" />
                    Настройки
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Match History Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon size={24} className="text-cyan-400" />
                  История игр
                </CardTitle>
                <CardDescription>Последние {matches.length} матчей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-muted/20 to-muted/5 hover:from-muted/30 hover:to-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            match.result === 'win' ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={match.result === 'win' ? 'default' : 'destructive'} className="text-xs">
                              {match.result === 'win' ? 'Победа' : 'Поражение'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {match.robotType}
                            </Badge>
                          </div>
                          <p className="font-semibold text-white text-sm">{match.arenaName}</p>
                          <p className="text-xs text-muted-foreground">
                            <CalendarIcon size={12} className="inline mr-1" />
                            {match.date} • {match.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{match.score}</p>
                          <p className="text-xs text-muted-foreground">{match.opponents} оппонента</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${match.earnings > 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                            {match.earnings > 0 ? `+${match.earnings}` : '0'} PAC
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Загрузить еще
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StarIcon size={24} className="text-purple-400" />
                  Достижения
                </CardTitle>
                <CardDescription>
                  Разблокировано {achievements.filter((a) => a.unlockedAt !== 'В процессе').length} из {achievements.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement) => {
                    const rarityConfig = RARITY_CONFIG[achievement.rarity];
                    const isUnlocked = achievement.unlockedAt !== 'В процессе';
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all hover-lift ${
                          isUnlocked
                            ? `${rarityConfig.bgColor} border-current`
                            : 'bg-muted/10 border-muted/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`text-4xl ${!isUnlocked && 'grayscale'}`}>{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className={`font-bold text-sm ${isUnlocked ? rarityConfig.color : 'text-muted-foreground'}`}>
                                {achievement.title}
                              </p>
                              <Badge variant="outline" className={`text-xs ${rarityConfig.color}`}>
                                {rarityConfig.label.slice(0, 1)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                            {achievement.progress !== undefined && achievement.maxProgress && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Прогресс</span>
                                  <span className="font-semibold text-white">
                                    {achievement.progress}/{achievement.maxProgress}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${rarityConfig.bgColor} transition-all`}
                                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {isUnlocked && !achievement.progress && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <CalendarIcon size={10} className="inline mr-1" />
                                {achievement.unlockedAt}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card glow className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CoinsIcon size={20} className="text-cyan-400" />
                    GAC Token
                  </CardTitle>
                  <CardDescription>Governance & Staking</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-cyan-400 mb-2">{wallet.gac.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ≈ ${(wallet.gac * 2.45).toFixed(2)}
                  </p>
                  <div className="space-y-2">
                    <Button variant="neon" size="sm" className="w-full">
                      Купить GAC
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Стейкинг
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card glow className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CoinsIcon size={20} className="text-purple-400" />
                    PAC Token
                  </CardTitle>
                  <CardDescription>Play & Earn</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-purple-400 mb-2">{wallet.pac.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    ≈ ${wallet.pac.toFixed(2)} (1:1)
                  </p>
                  <div className="space-y-2">
                    <Button variant="neon" size="sm" className="w-full">
                      Вывести PAC
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      История
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card glow className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <WalletIcon size={20} className="text-yellow-400" />
                    Общий баланс
                  </CardTitle>
                  <CardDescription>USD эквивалент</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-400 mb-2">
                    ${wallet.usd.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-400 mb-4">+12.5% за месяц</p>
                  <div className="space-y-2">
                    <Button variant="neon" size="sm" className="w-full">
                      Пополнить
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Вывести
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card glow className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon size={24} className="text-cyan-400" />
                  История транзакций
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'win', amount: '+150 PAC', desc: 'Выигрыш в Tokyo Cyber Arena', time: '2 часа назад' },
                    { type: 'stake', amount: '-500 GAC', desc: 'Стейкинг GAC (Gold tier)', time: '1 день назад' },
                    { type: 'win', amount: '+200 PAC', desc: 'Выигрыш в Singapore Marina', time: '1 день назад' },
                    { type: 'buy', amount: '+1000 GAC', desc: 'Покупка GAC токенов', time: '3 дня назад' },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            tx.type === 'win'
                              ? 'bg-green-400'
                              : tx.type === 'stake'
                              ? 'bg-purple-400'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-white text-sm">{tx.desc}</p>
                          <p className="text-xs text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                      <p
                        className={`font-bold ${
                          tx.amount.startsWith('+') ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      >
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все транзакции
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
