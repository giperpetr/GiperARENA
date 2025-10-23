'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data
const MOCK_USER = {
  id: '1',
  username: 'CyberGamer',
  email: 'cyber@example.com',
  avatar_url: '🎮',
  reputation_score: 4850,
  wallet_address: '0x1234...5678',
  created_at: '2024-01-15',
  stats: {
    total_games: 234,
    wins: 156,
    tournaments_participated: 12,
    tournaments_won: 3,
    total_score: 1250000,
    average_score: 5341,
    achievements_earned: 24,
    nfts_owned: 8,
  },
  wallet: {
    gac_balance: 1250.5,
    pac_balance: 8540.25,
    staked_amount: 5000,
    staking_tier: 'silver',
  },
  recent_games: [
    { arena: 'Tokyo Cyber Arena', score: 9850, time: '2m 45s', date: '2 часа назад' },
    { arena: 'Berlin Tech Arena', score: 8720, time: '3m 12s', date: '5 часов назад' },
    { arena: 'Dubai Future Arena', score: 9650, time: '2m 38s', date: '1 день назад' },
  ],
  achievements: [
    { id: '1', name: 'Первая победа', icon: '🏆', rarity: 'common' },
    { id: '2', name: 'Скоростной гонщик', icon: '⚡', rarity: 'rare' },
    { id: '3', name: 'Мастер турниров', icon: '👑', rarity: 'epic' },
    { id: '4', name: 'Легенда арены', icon: '🌟', rarity: 'legendary' },
  ],
};

const STAKING_TIERS = {
  bronze: { name: 'Бронза', color: 'text-orange-500', min: 1000 },
  silver: { name: 'Серебро', color: 'text-gray-400', min: 10000 },
  gold: { name: 'Золото', color: 'text-yellow-500', min: 50000 },
  platinum: { name: 'Платина', color: 'text-cyan-400', min: 100000 },
};

export default function ProfilePage() {
  const winRate = ((MOCK_USER.stats.wins / MOCK_USER.stats.total_games) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center text-5xl shadow-glow-cyan">
                {MOCK_USER.avatar_url}
              </div>
              <div className="absolute -bottom-2 -right-2">
                <Badge variant="neon">Lvl 42</Badge>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gradient-cyan-purple mb-2">
                {MOCK_USER.username}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                <span>Репутация: {MOCK_USER.reputation_score}</span>
                <span>•</span>
                <span>На платформе с {MOCK_USER.created_at}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{MOCK_USER.wallet_address}</Badge>
                {MOCK_USER.wallet.staking_tier && (
                  <Badge
                    variant="secondary"
                    className={STAKING_TIERS[MOCK_USER.wallet.staking_tier as keyof typeof STAKING_TIERS].color}
                  >
                    {STAKING_TIERS[MOCK_USER.wallet.staking_tier as keyof typeof STAKING_TIERS].name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline">Редактировать</Button>
              <Button variant="ghost">⚙️</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card glow className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {MOCK_USER.stats.total_games}
                  </p>
                  <p className="text-sm text-muted-foreground">Всего игр</p>
                </CardContent>
              </Card>
              <Card glow className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-secondary mb-1">{winRate}%</p>
                  <p className="text-sm text-muted-foreground">Побед</p>
                </CardContent>
              </Card>
              <Card glow className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-neon-cyan mb-1">
                    {MOCK_USER.stats.tournaments_won}
                  </p>
                  <p className="text-sm text-muted-foreground">Турниров</p>
                </CardContent>
              </Card>
              <Card glow className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-neon-purple mb-1">
                    {MOCK_USER.stats.achievements_earned}
                  </p>
                  <p className="text-sm text-muted-foreground">Достижений</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Games */}
            <Card glow>
              <CardHeader>
                <CardTitle>Недавние игры</CardTitle>
                <CardDescription>Ваша игровая история</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_USER.recent_games.map((game, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg glass hover-lift"
                    >
                      <div>
                        <p className="font-semibold">{game.arena}</p>
                        <p className="text-sm text-muted-foreground">{game.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">
                          {game.score.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{game.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Показать все
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card glow>
              <CardHeader>
                <CardTitle>Достижения</CardTitle>
                <CardDescription>
                  {MOCK_USER.stats.achievements_earned} из 100 получено
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_USER.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="text-center p-4 rounded-lg glass hover-lift group"
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                        {achievement.icon}
                      </div>
                      <p className="text-sm font-semibold mb-1">{achievement.name}</p>
                      <Badge
                        variant={
                          achievement.rarity === 'legendary'
                            ? 'neon'
                            : achievement.rarity === 'epic'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Посмотреть все достижения
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet */}
            <Card glow>
              <CardHeader>
                <CardTitle>Кошелёк</CardTitle>
                <CardDescription>Ваши токены</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">GAC</span>
                    <Badge variant="neon">Governance</Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {MOCK_USER.wallet.gac_balance.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-lg glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">PAC</span>
                    <Badge variant="secondary">Utility</Badge>
                  </div>
                  <p className="text-2xl font-bold text-secondary">
                    {MOCK_USER.wallet.pac_balance.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="neon" className="flex-1">
                    Пополнить
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Вывести
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Staking */}
            <Card glow>
              <CardHeader>
                <CardTitle>Стейкинг</CardTitle>
                <CardDescription>Замороженные PAC токены</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg glass">
                  <p className="text-sm text-muted-foreground mb-1">Застейкано</p>
                  <p className="text-3xl font-bold text-neon-purple">
                    {MOCK_USER.wallet.staked_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PAC</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Уровень</span>
                    <span className="font-bold">
                      {STAKING_TIERS[MOCK_USER.wallet.staking_tier as keyof typeof STAKING_TIERS].name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rewards</span>
                    <span className="font-bold text-primary">+5% APY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unlock</span>
                    <span className="font-bold">15 дней</span>
                  </div>
                </div>

                <Button variant="secondary" className="w-full">
                  Управление стейкингом
                </Button>
              </CardContent>
            </Card>

            {/* NFTs */}
            <Card glow>
              <CardHeader>
                <CardTitle>NFT коллекция</CardTitle>
                <CardDescription>{MOCK_USER.stats.nfts_owned} NFT</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg glass flex items-center justify-center text-2xl hover-lift"
                    >
                      {i < MOCK_USER.stats.nfts_owned ? '🖼️' : '🔒'}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Посмотреть коллекцию
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
