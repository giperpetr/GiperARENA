'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

const STAKING_TIERS = {
  bronze: { name: 'Бронза', color: 'text-orange-500', min: 1000 },
  silver: { name: 'Серебро', color: 'text-gray-400', min: 10000 },
  gold: { name: 'Золото', color: 'text-yellow-500', min: 50000 },
  platinum: { name: 'Платина', color: 'text-cyan-400', min: 100000 },
};

const MOCK_ACHIEVEMENTS = [
  { id: '1', name: 'Первая победа', icon: '🏆', rarity: 'common' },
  { id: '2', name: 'Скоростной гонщик', icon: '⚡', rarity: 'rare' },
  { id: '3', name: 'Мастер турниров', icon: '👑', rarity: 'epic' },
  { id: '4', name: 'Легенда арены', icon: '🌟', rarity: 'legendary' },
];

export default function ProfilePage() {
  // Fetch current user profile
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response: any = await api.getCurrentUser();
      return response.data || response;
    },
  });

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user', user?.id, 'stats'],
    queryFn: async () => {
      if (!user?.id) return null;
      const response: any = await api.getUserStats(user.id);
      return response.data || response;
    },
    enabled: !!user?.id,
  });

  // Fetch wallet info
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response: any = await api.getWallet(user.id);
      return response.data || response;
    },
    enabled: !!user?.id,
  });

  // Fetch recent games
  const { data: recentGames, isLoading: gamesLoading } = useQuery({
    queryKey: ['sessions', 'user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response: any = await api.getGameSessions({
        player_id: user.id,
        limit: 5,
      });
      return response || [];
    },
    enabled: !!user?.id,
  });

  const isLoading = userLoading || statsLoading || walletLoading || gamesLoading;

  // Calculate win rate
  const winRate = stats?.total_games
    ? ((stats.wins / stats.total_games) * 100).toFixed(1)
    : '0.0';

  // Auth error - show login prompt
  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card glow className="max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Войдите в систему, чтобы просмотреть ваш профиль
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="neon" className="w-full" onClick={() => (window.location.href = '/auth/login')}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full glass flex items-center justify-center text-5xl shadow-glow-cyan">
                  {user?.avatar_url || '🎮'}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <Badge variant="neon">Lvl {Math.floor((stats?.reputation_score || 0) / 100) || 1}</Badge>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gradient-cyan-purple mb-2">
                  {user?.username || 'Игрок'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span>Репутация: {stats?.reputation_score || 0}</span>
                  <span>•</span>
                  <span>
                    На платформе с{' '}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('ru-RU')
                      : 'недавно'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user?.wallet_address && (
                    <Badge variant="outline">
                      {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                    </Badge>
                  )}
                  {wallet?.staking_tier && (
                    <Badge
                      variant="secondary"
                      className={STAKING_TIERS[wallet.staking_tier as keyof typeof STAKING_TIERS]?.color || ''}
                    >
                      {STAKING_TIERS[wallet.staking_tier as keyof typeof STAKING_TIERS]?.name || wallet.staking_tier}
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
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} glow className="text-center">
                    <CardContent className="pt-6">
                      <Skeleton className="h-8 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card glow className="text-center">
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-primary mb-1">
                        {stats?.total_games || 0}
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
                        {stats?.tournaments_won || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Турниров</p>
                    </CardContent>
                  </Card>
                  <Card glow className="text-center">
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-neon-purple mb-1">
                        {stats?.achievements_earned || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Достижений</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Games */}
            <Card glow>
              <CardHeader>
                <CardTitle>Недавние игры</CardTitle>
                <CardDescription>Ваша игровая история</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recentGames && recentGames.length > 0 ? (
                  <div className="space-y-3">
                    {recentGames.map((game: any) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 rounded-lg glass hover-lift"
                      >
                        <div>
                          <p className="font-semibold">{game.arenas?.name || 'Арена'}</p>
                          <p className="text-sm text-muted-foreground">
                            {game.created_at
                              ? new Date(game.created_at).toLocaleString('ru-RU')
                              : 'Недавно'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            {game.score?.toLocaleString() || '0'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {game.duration_seconds
                              ? `${Math.floor(game.duration_seconds / 60)}м ${game.duration_seconds % 60}с`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Пока нет сыгранных игр</p>
                    <Button variant="outline" className="mt-4" onClick={() => (window.location.href = '/arenas')}>
                      Начать играть
                    </Button>
                  </div>
                )}
                {recentGames && recentGames.length > 0 && (
                  <Button variant="outline" className="w-full mt-4">
                    Показать все
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card glow>
              <CardHeader>
                <CardTitle>Достижения</CardTitle>
                <CardDescription>
                  {stats?.achievements_earned || 0} из 100 получено
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_ACHIEVEMENTS.map((achievement) => (
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
                {isLoading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-lg glass">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">GAC</span>
                        <Badge variant="neon">Governance</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {wallet?.gac_balance?.toLocaleString() || '0'}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg glass">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">PAC</span>
                        <Badge variant="secondary">Utility</Badge>
                      </div>
                      <p className="text-2xl font-bold text-secondary">
                        {wallet?.pac_balance?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </>
                )}

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
                {isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <>
                    <div className="text-center p-4 rounded-lg glass">
                      <p className="text-sm text-muted-foreground mb-1">Застейкано</p>
                      <p className="text-3xl font-bold text-neon-purple">
                        {wallet?.staked_amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PAC</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Уровень</span>
                        <span className="font-bold">
                          {wallet?.staking_tier
                            ? STAKING_TIERS[wallet.staking_tier as keyof typeof STAKING_TIERS]?.name
                            : 'Нет'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rewards</span>
                        <span className="font-bold text-primary">+5% APY</span>
                      </div>
                    </div>
                  </>
                )}

                <Button variant="secondary" className="w-full">
                  Управление стейкингом
                </Button>
              </CardContent>
            </Card>

            {/* NFTs */}
            <Card glow>
              <CardHeader>
                <CardTitle>NFT коллекция</CardTitle>
                <CardDescription>{stats?.nfts_owned || 0} NFT</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg glass flex items-center justify-center text-2xl hover-lift"
                    >
                      {i < (stats?.nfts_owned || 0) ? '🖼️' : '🔒'}
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
