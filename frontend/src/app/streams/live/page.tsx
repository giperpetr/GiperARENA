'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, PlayIcon, FireIcon, UsersIcon, VideoIcon } from '@/components/ui/icons';

interface LiveStream {
  id: string;
  streamerName: string;
  streamerAvatar: string;
  arenaName: string;
  gameType: 'drone' | 'robot' | 'crawler';
  viewers: number;
  duration: string;
  thumbnailUrl?: string;
  isHot: boolean;
}

const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: '1',
    streamerName: 'DroneMaster_Pro',
    streamerAvatar: '🚁',
    arenaName: 'Tokyo Cyber Arena',
    gameType: 'drone',
    viewers: 2345,
    duration: '1:23:45',
    isHot: true,
  },
  {
    id: '2',
    streamerName: 'RobotKing_42',
    streamerAvatar: '🤖',
    arenaName: 'Berlin Battle Zone',
    gameType: 'robot',
    viewers: 1876,
    duration: '0:45:12',
    isHot: true,
  },
  {
    id: '3',
    streamerName: 'SpeedRacer_Moscow',
    streamerAvatar: '🏎️',
    arenaName: 'Moscow Sky Arena',
    gameType: 'crawler',
    viewers: 1234,
    duration: '0:32:08',
    isHot: false,
  },
  {
    id: '4',
    streamerName: 'AerialAce',
    streamerAvatar: '✈️',
    arenaName: 'Dubai Future Arena',
    gameType: 'drone',
    viewers: 987,
    duration: '2:15:30',
    isHot: false,
  },
  {
    id: '5',
    streamerName: 'MechWarrior_NYC',
    streamerAvatar: '⚙️',
    arenaName: 'New York Battle Zone',
    gameType: 'robot',
    viewers: 856,
    duration: '0:18:45',
    isHot: false,
  },
  {
    id: '6',
    streamerName: 'TurboDriver',
    streamerAvatar: '🏁',
    arenaName: 'LA Speed Track',
    gameType: 'crawler',
    viewers: 654,
    duration: '1:05:20',
    isHot: false,
  },
  {
    id: '7',
    streamerName: 'SkyDancer_Seoul',
    streamerAvatar: '🎯',
    arenaName: 'Seoul Tech Arena',
    gameType: 'drone',
    viewers: 543,
    duration: '0:12:33',
    isHot: false,
  },
  {
    id: '8',
    streamerName: 'IronGiant',
    streamerAvatar: '🦾',
    arenaName: 'Paris Circuit',
    gameType: 'robot',
    viewers: 432,
    duration: '0:55:18',
    isHot: false,
  },
];

const GAME_TYPE_CONFIG = {
  drone: { label: 'Дроны', icon: '🚁', color: 'bg-cyan-500/20 text-cyan-400' },
  robot: { label: 'Роботы', icon: '🤖', color: 'bg-purple-500/20 text-purple-400' },
  crawler: { label: 'RC Машины', icon: '🏎️', color: 'bg-orange-500/20 text-orange-400' },
};

export default function LiveStreamsPage() {
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);

  const filteredStreams = selectedGameType
    ? MOCK_LIVE_STREAMS.filter((stream) => stream.gameType === selectedGameType)
    : MOCK_LIVE_STREAMS;

  const totalViewers = MOCK_LIVE_STREAMS.reduce((sum, stream) => sum + stream.viewers, 0);

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold flex items-center gap-4">
            <VideoIcon size={48} className="text-red-500 animate-pulse" />
            <span className="text-gradient-cyan-purple">Живые трансляции</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Смотрите игры в реальном времени с арен по всему миру
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Card glow className="glass border-red-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активных стримов</p>
                  <p className="text-3xl font-bold text-red-400">{MOCK_LIVE_STREAMS.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <PlayIcon size={24} className="text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-cyan-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего зрителей</p>
                  <p className="text-3xl font-bold text-cyan-400">{totalViewers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <EyeIcon size={24} className="text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Горячие стримы</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {MOCK_LIVE_STREAMS.filter((s) => s.isHot).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <FireIcon size={24} className="text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedGameType === null ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType(null)}
                >
                  Все игры ({MOCK_LIVE_STREAMS.length})
                </Button>
                <Button
                  variant={selectedGameType === 'drone' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('drone')}
                >
                  🚁 Дроны ({MOCK_LIVE_STREAMS.filter((s) => s.gameType === 'drone').length})
                </Button>
                <Button
                  variant={selectedGameType === 'robot' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('robot')}
                >
                  🤖 Роботы ({MOCK_LIVE_STREAMS.filter((s) => s.gameType === 'robot').length})
                </Button>
                <Button
                  variant={selectedGameType === 'crawler' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameType('crawler')}
                >
                  🏎️ RC Машины ({MOCK_LIVE_STREAMS.filter((s) => s.gameType === 'crawler').length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Streams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStreams.map((stream) => (
            <Card key={stream.id} glow className="glass hover:border-red-500/50 transition-all hover-lift group">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-space-dark-gray to-space-medium-gray rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{stream.streamerAvatar}</div>
                  </div>
                  
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white mr-2" />
                      LIVE
                    </Badge>
                  </div>

                  {/* Hot Badge */}
                  {stream.isHot && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-500/90 text-white">
                        <FireIcon size={14} className="mr-1" />
                        HOT
                      </Badge>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-black/80">
                      {stream.duration}
                    </Badge>
                  </div>

                  {/* Viewers */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-black/80 flex items-center gap-1">
                      <EyeIcon size={14} />
                      {stream.viewers.toLocaleString()}
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
                  <h3 className="font-bold text-white mb-2 truncate">{stream.streamerName}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={GAME_TYPE_CONFIG[stream.gameType].color}>
                      {GAME_TYPE_CONFIG[stream.gameType].icon} {GAME_TYPE_CONFIG[stream.gameType].label}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground truncate mb-3">{stream.arenaName}</p>

                  <Button variant="neon" size="sm" className="w-full" asChild>
                    <Link href={`/streams/${stream.id}`}>
                      <PlayIcon size={16} className="mr-2" />
                      Смотреть
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStreams.length === 0 && (
          <Card glow className="glass">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                Сейчас нет активных стримов в этой категории
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-12">
          <Card glow className="glass border-purple-500/50">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Хотите стримить свои игры?</h2>
              <p className="text-muted-foreground mb-6">
                Подключите свой аккаунт и начните транслировать игры с арен ArenaHUB
              </p>
              <Button variant="neon" size="lg" asChild>
                <Link href="/settings/streaming">Настроить стриминг</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
