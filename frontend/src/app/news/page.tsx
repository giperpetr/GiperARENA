'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrophyIcon,
  ArenaIcon,
  CoinsIcon,
  FireIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
} from '@/components/ui/icons';
import { api } from '@/lib/api-client';

type NewsCategory = 'all' | 'tournaments' | 'arenas' | 'blockchain' | 'community' | 'updates';

interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  date: string;
  readTime: number; // minutes
  featured: boolean;
  image?: string;
  author: string;
  views: number;
  tags: string[];
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Глобальный турнир World Drone Championship 2026 стартует в апреле',
    category: 'tournaments',
    excerpt:
      'Крупнейший турнир по дрон-рейсингу в истории ArenaHUB. Призовой фонд 500,000 PAC. Регистрация открыта для всех игроков с рейтингом Gold и выше.',
    date: '2025-10-28',
    readTime: 5,
    featured: true,
    author: 'ArenaHUB Team',
    views: 12543,
    tags: ['турниры', 'дроны', 'world championship'],
  },
  {
    id: '2',
    title: 'Открытие новой арены в Сингапуре: Marina Tech Arena',
    category: 'arenas',
    excerpt:
      'Первая в Азии арена с поддержкой подводных роботов! 8 камер 4K, уникальные трассы и экосистема для морских состязаний.',
    date: '2025-10-27',
    readTime: 4,
    featured: true,
    author: 'Marina Tech Team',
    views: 8934,
    tags: ['арены', 'сингапур', 'подводные роботы'],
  },
  {
    id: '3',
    title: 'GAC Staking 2.0: Новые уровни и повышенные награды',
    category: 'blockchain',
    excerpt:
      'Обновление стейкинг-системы: 5 новых уровней (от Starter до Legendary), APY до 25%, ускоренная разблокировка для долгосрочных держателей.',
    date: '2025-10-26',
    readTime: 6,
    featured: false,
    author: 'Blockchain Team',
    views: 15678,
    tags: ['GAC', 'стейкинг', 'токеномика'],
  },
  {
    id: '4',
    title: 'Сообщество ArenaHUB достигло 100,000 игроков!',
    category: 'community',
    excerpt:
      'Невероятная веха! Спасибо всем игрокам за поддержку. В честь этого события - специальные NFT для первых 10,000 игроков и недельный буст XP.',
    date: '2025-10-25',
    readTime: 3,
    featured: false,
    author: 'Community Manager',
    views: 9876,
    tags: ['сообщество', 'milestone', 'NFT'],
  },
  {
    id: '5',
    title: 'Обновление платформы v2.5: WebRTC оптимизация и новые фичи',
    category: 'updates',
    excerpt:
      'Снижение латентности до 50ms, улучшенная стабильность стримов, новые фильтры в таблице лидеров, интеграция с Discord и улучшенный UI.',
    date: '2025-10-24',
    readTime: 7,
    featured: false,
    author: 'Development Team',
    views: 7654,
    tags: ['обновления', 'WebRTC', 'производительность'],
  },
  {
    id: '6',
    title: 'Robot Combat League: Финал сезона 3 в эту пятницу',
    category: 'tournaments',
    excerpt:
      'Легендарное противостояние BattleBot_Titan против IronDestroyer в финале Robot Combat League Season 3. Ставки открыты, прямая трансляция на всех платформах.',
    date: '2025-10-23',
    readTime: 4,
    featured: false,
    author: 'Tournament Organizers',
    views: 11234,
    tags: ['турниры', 'роботы', 'финал'],
  },
  {
    id: '7',
    title: 'Новый режим игры: Team Battle 5v5',
    category: 'updates',
    excerpt:
      'Командные сражения теперь доступны! Создавайте команды до 5 игроков, координируйте действия и побеждайте в новом PvP режиме с уникальными наградами.',
    date: '2025-10-22',
    readTime: 5,
    featured: false,
    author: 'Game Design Team',
    views: 13456,
    tags: ['обновления', 'командные игры', 'PvP'],
  },
  {
    id: '8',
    title: 'Партнерство с DJI: Новые дроны FPV Racing Pro в аренах',
    category: 'arenas',
    excerpt:
      'ArenaHUB и DJI объявляют о партнерстве. В топ-аренах появятся дроны DJI FPV Racing Pro с улучшенной маневренностью и скоростью до 140 км/ч.',
    date: '2025-10-21',
    readTime: 4,
    featured: false,
    author: 'Partnership Team',
    views: 10123,
    tags: ['партнерства', 'DJI', 'дроны'],
  },
];

const CATEGORY_CONFIG = {
  all: { label: 'Все новости', icon: FireIcon, color: 'text-neon-cyan' },
  tournaments: { label: 'Турниры', icon: TrophyIcon, color: 'text-yellow-500' },
  arenas: { label: 'Арены', icon: ArenaIcon, color: 'text-cyan-400' },
  blockchain: { label: 'Блокчейн', icon: CoinsIcon, color: 'text-purple-400' },
  community: { label: 'Сообщество', icon: UsersIcon, color: 'text-pink-400' },
  updates: { label: 'Обновления', icon: FireIcon, color: 'text-orange-400' },
};

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');

  // Fetch upcoming tournaments for sidebar
  const { data: upcomingTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments', 'upcoming'],
    queryFn: async () => {
      const response: any = await api.getTournaments({
        status: 'upcoming',
        limit: 1,
      });
      return response || [];
    },
  });

  // Fetch newest arenas for sidebar
  const { data: recentArenas, isLoading: arenasLoading } = useQuery({
    queryKey: ['arenas', 'recent'],
    queryFn: async () => {
      const response = await api.getArenas({
        limit: 1,
        sort: 'created_at.desc',
      });
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch platform stats for player count
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', 'platform'],
    queryFn: async () => {
      const response = await fetch('https://api.giperarena.space/api/v1/stats/platform');
      if (!response.ok) return null;
      const json = await response.json();
      return json.data || json;
    },
  });

  const filteredNews =
    selectedCategory === 'all'
      ? MOCK_NEWS
      : MOCK_NEWS.filter((article) => article.category === selectedCategory);

  const featuredArticles = MOCK_NEWS.filter((article) => article.featured);

  const nextTournament = upcomingTournaments?.[0];
  const newestArena = recentArenas?.[0];
  const playerCount = platformStats?.uniquePlayers || 100000;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-gradient-cyan-purple">Новости ArenaHUB</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Последние обновления платформы, турниры, новые арены и события
          </p>
        </div>

        {/* Featured Articles */}
        {selectedCategory === 'all' && featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-white flex items-center gap-3">
              <FireIcon size={32} className="text-orange-400" />
              Главные новости
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredArticles.map((article) => {
                const CategoryIcon = CATEGORY_CONFIG[article.category].icon;
                return (
                  <Card key={article.id} glow className="glass border-primary/50 hover-lift">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="bg-orange-500/20 text-orange-400">
                          <FireIcon size={14} className="mr-1" />
                          Featured
                        </Badge>
                        <Badge variant="outline">
                          <CategoryIcon size={14} className="mr-1" />
                          {CATEGORY_CONFIG[article.category].label}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{article.title}</CardTitle>
                      <CardDescription className="text-base">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {new Date(article.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon size={14} />
                            {article.readTime} мин
                          </span>
                        </div>
                        <span>{article.views.toLocaleString()} просмотров</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="neon" size="sm" asChild>
                        <Link href={`/news/${article.id}`}>Читать далее</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Категории</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_CONFIG) as NewsCategory[]).map((category) => {
                  const config = CATEGORY_CONFIG[category];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'neon' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <Icon size={16} className="mr-2" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">
            {selectedCategory === 'all'
              ? 'Все новости'
              : CATEGORY_CONFIG[selectedCategory].label}
          </h2>
          {filteredNews.length === 0 ? (
            <Card glow className="glass">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Новостей в этой категории пока нет
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((article) => {
                const CategoryIcon = CATEGORY_CONFIG[article.category].icon;
                return (
                  <Card
                    key={article.id}
                    glow
                    className="glass hover:border-primary/50 transition-all hover-lift"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                          <CategoryIcon
                            size={28}
                            className={CATEGORY_CONFIG[article.category].color}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon size={12} className="mr-1" />
                              {CATEGORY_CONFIG[article.category].label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon size={12} />
                              {new Date(article.date).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ClockIcon size={12} />
                              {article.readTime} мин
                            </span>
                          </div>

                          <h3 className="text-xl font-bold mb-2 text-white hover:text-cyan-400 transition-colors">
                            <Link href={`/news/${article.id}`}>{article.title}</Link>
                          </h3>

                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                {article.views.toLocaleString()} просмотров
                              </span>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/news/${article.id}`}>Читать</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {filteredNews.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Загрузить еще
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Upcoming Tournament */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon size={20} className="text-yellow-500" />
                Следующий турнир
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentsLoading ? (
                <>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-1/2 mb-4" />
                </>
              ) : nextTournament ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    {nextTournament.name}
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {nextTournament.start_date
                      ? new Date(nextTournament.start_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Скоро'}
                  </p>
                  <Button variant="neon" size="sm" className="mt-4 w-full" asChild>
                    <Link href={`/tournaments/${nextTournament.id}`}>Подробнее</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Новые турниры скоро
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link href="/tournaments">Смотреть все</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Newest Arena */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArenaIcon size={20} className="text-cyan-400" />
                Новые арены
              </CardTitle>
            </CardHeader>
            <CardContent>
              {arenasLoading ? (
                <>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-1/2 mb-4" />
                </>
              ) : newestArena ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">{newestArena.name}</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {newestArena.city || newestArena.country || 'Онлайн'}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link href={`/arenas/${newestArena.id}`}>Посетить</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Загрузка...</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link href="/arenas">Смотреть все</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon size={20} className="text-pink-400" />
                Сообщество
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-1/2 mb-4" />
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Активных игроков</p>
                  <p className="text-2xl font-bold text-neon-cyan">
                    {playerCount.toLocaleString()}+
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <Link href="/community">Присоединиться</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
