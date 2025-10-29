'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FireIcon, PlayIcon, ThumbsUpIcon, EyeIcon, ShareIcon } from '@/components/ui/icons';

interface Highlight {
  id: string;
  title: string;
  playerName: string;
  playerAvatar: string;
  arenaName: string;
  gameType: 'drone' | 'robot' | 'crawler';
  views: number;
  likes: number;
  duration: string;
  uploadedAt: string;
  thumbnailUrl?: string;
  isTrending: boolean;
}

const MOCK_HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    title: 'Невероятный обгон на последних секундах! 🔥',
    playerName: 'DroneMaster_Pro',
    playerAvatar: '🚁',
    arenaName: 'Tokyo Cyber Arena',
    gameType: 'drone',
    views: 45678,
    likes: 3456,
    duration: '0:45',
    uploadedAt: '2 часа назад',
    isTrending: true,
  },
  {
    id: '2',
    title: 'Epic Robot Combat - Нокаут за 10 секунд!',
    playerName: 'RobotKing_42',
    playerAvatar: '🤖',
    arenaName: 'Berlin Battle Zone',
    gameType: 'robot',
    views: 38945,
    likes: 2987,
    duration: '1:12',
    uploadedAt: '5 часов назад',
    isTrending: true,
  },
  {
    id: '3',
    title: 'Идеальный дрифт через три препятствия',
    playerName: 'SpeedRacer_Moscow',
    playerAvatar: '🏎️',
    arenaName: 'Moscow Sky Arena',
    gameType: 'crawler',
    views: 32156,
    likes: 2345,
    duration: '0:38',
    uploadedAt: '1 день назад',
    isTrending: true,
  },
  {
    id: '4',
    title: 'Drone Racing - Прыжок на 15 метров',
    playerName: 'AerialAce',
    playerAvatar: '✈️',
    arenaName: 'Dubai Future Arena',
    gameType: 'drone',
    views: 28934,
    likes: 1987,
    duration: '0:52',
    uploadedAt: '2 дня назад',
    isTrending: false,
  },
  {
    id: '5',
    title: 'Battle Bot - Triple Kill комбо',
    playerName: 'MechWarrior_NYC',
    playerAvatar: '⚙️',
    arenaName: 'New York Battle Zone',
    gameType: 'robot',
    views: 25678,
    likes: 1756,
    duration: '1:05',
    uploadedAt: '3 дня назад',
    isTrending: false,
  },
  {
    id: '6',
    title: 'RC Car - Backflip через горящий обруч',
    playerName: 'TurboDriver',
    playerAvatar: '🏁',
    arenaName: 'LA Speed Track',
    gameType: 'crawler',
    views: 23456,
    likes: 1654,
    duration: '0:42',
    uploadedAt: '4 дня назад',
    isTrending: false,
  },
  {
    id: '7',
    title: 'Drone Acrobatics - 360° barrel roll',
    playerName: 'SkyDancer_Seoul',
    playerAvatar: '🎯',
    arenaName: 'Seoul Tech Arena',
    gameType: 'drone',
    views: 19876,
    likes: 1345,
    duration: '0:35',
    uploadedAt: '5 дней назад',
    isTrending: false,
  },
  {
    id: '8',
    title: 'Robot Rumble - Comeback победа',
    playerName: 'IronGiant',
    playerAvatar: '🦾',
    arenaName: 'Paris Circuit',
    gameType: 'robot',
    views: 17654,
    likes: 1234,
    duration: '1:18',
    uploadedAt: '6 дней назад',
    isTrending: false,
  },
  {
    id: '9',
    title: 'Fastest Lap Record - 23.4 seconds',
    playerName: 'SpeedDemon',
    playerAvatar: '💨',
    arenaName: 'Singapore Tech Hub',
    gameType: 'crawler',
    views: 15432,
    likes: 1098,
    duration: '0:28',
    uploadedAt: '1 неделя назад',
    isTrending: false,
  },
];

const GAME_TYPE_CONFIG = {
  drone: { label: 'Дроны', icon: '🚁', color: 'bg-cyan-500/20 text-cyan-400' },
  robot: { label: 'Роботы', icon: '🤖', color: 'bg-purple-500/20 text-purple-400' },
  crawler: { label: 'RC Машины', icon: '🏎️', color: 'bg-orange-500/20 text-orange-400' },
};

type SortOption = 'trending' | 'views' | 'likes' | 'recent';

export default function HighlightsPage() {
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  let filteredHighlights = selectedGameType
    ? MOCK_HIGHLIGHTS.filter((highlight) => highlight.gameType === selectedGameType)
    : MOCK_HIGHLIGHTS;

  // Sort
  filteredHighlights = [...filteredHighlights].sort((a, b) => {
    if (sortBy === 'trending') return b.isTrending ? 1 : -1;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'likes') return b.likes - a.likes;
    return 0; // recent - already sorted by uploadedAt
  });

  const totalViews = MOCK_HIGHLIGHTS.reduce((sum, h) => sum + h.views, 0);
  const totalLikes = MOCK_HIGHLIGHTS.reduce((sum, h) => sum + h.likes, 0);

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold flex items-center gap-4">
            <FireIcon size={48} className="text-orange-400" />
            <span className="text-gradient-cyan-purple">Лучшие моменты</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Самые эпичные клипы из игр ArenaHUB
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Card glow className="glass border-cyan-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего клипов</p>
                  <p className="text-3xl font-bold text-cyan-400">{MOCK_HIGHLIGHTS.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <PlayIcon size={24} className="text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-purple-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Просмотров</p>
                  <p className="text-3xl font-bold text-purple-400">{(totalViews / 1000).toFixed(1)}K</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <EyeIcon size={24} className="text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Лайков</p>
                  <p className="text-3xl font-bold text-orange-400">{(totalLikes / 1000).toFixed(1)}K</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <ThumbsUpIcon size={24} className="text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Sorting */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          {/* Game Type Filter */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Тип игры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedGameType === null ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType(null)}
                >
                  Все
                </Button>
                <Button
                  variant={selectedGameType === 'drone' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('drone')}
                >
                  🚁 Дроны
                </Button>
                <Button
                  variant={selectedGameType === 'robot' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('robot')}
                >
                  🤖 Роботы
                </Button>
                <Button
                  variant={selectedGameType === 'crawler' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('crawler')}
                >
                  🏎️ RC Машины
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sort */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Сортировка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'trending' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('trending')}
                >
                  🔥 Trending
                </Button>
                <Button
                  variant={sortBy === 'views' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('views')}
                >
                  👁️ По просмотрам
                </Button>
                <Button
                  variant={sortBy === 'likes' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('likes')}
                >
                  👍 По лайкам
                </Button>
                <Button
                  variant={sortBy === 'recent' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  🕐 Новые
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Highlights Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHighlights.map((highlight) => (
            <Card key={highlight.id} glow className="glass hover:border-orange-500/50 transition-all hover-lift group">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-space-dark-gray to-space-medium-gray rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{highlight.playerAvatar}</div>
                  </div>

                  {/* Trending Badge */}
                  {highlight.isTrending && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-500 text-white">
                        <FireIcon size={14} className="mr-1" />
                        TRENDING
                      </Badge>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-black/80">
                      {highlight.duration}
                    </Badge>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <PlayIcon size={32} className="text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2">{highlight.title}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={GAME_TYPE_CONFIG[highlight.gameType].color}>
                      {GAME_TYPE_CONFIG[highlight.gameType].icon}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{highlight.playerName}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{highlight.arenaName} • {highlight.uploadedAt}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <EyeIcon size={14} />
                      {(highlight.views / 1000).toFixed(1)}K
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUpIcon size={14} />
                      {(highlight.likes / 1000).toFixed(1)}K
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="neon" size="sm" className="flex-1" asChild>
                      <Link href={`/streams/highlights/${highlight.id}`}>
                        <PlayIcon size={16} className="mr-2" />
                        Смотреть
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShareIcon size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHighlights.length === 0 && (
          <Card glow className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                Клипы в этой категории не найдены
              </p>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {filteredHighlights.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Загрузить ещё
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <Card glow className="glass border-cyan-500/50">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Есть эпичный момент?</h2>
              <p className="text-muted-foreground mb-6">
                Загрузите свои лучшие клипы и получайте лайки от сообщества
              </p>
              <Button variant="neon" size="lg" asChild>
                <Link href="/upload">Загрузить клип</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
