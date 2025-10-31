'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GamepadIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  PlayIcon
} from '@/components/ui/icons';
import { api } from '@/lib/api-client';
import Link from 'next/link';

// Arena type translations and icons
const ARENA_TYPE_INFO: Record<string, { name: string; emoji: string; description: string }> = {
  combat: {
    name: 'Бои роботов',
    emoji: '🤖',
    description: 'Управляйте боевыми роботами в реальных поединках'
  },
  racing: {
    name: 'Гонки дронов',
    emoji: '🚁',
    description: 'Пилотируйте дроны на скоростных трассах'
  },
  crawler: {
    name: 'Гусеничные машины',
    emoji: '🕷️',
    description: 'Проходите сложные препятствия на краулерах'
  },
  tank: {
    name: 'Танковые бои',
    emoji: '🚜',
    description: 'Сражения на радиоуправляемых танках'
  },
  parkour: {
    name: 'Паркур',
    emoji: '🏃',
    description: 'Преодолевайте препятствия на скорость'
  },
  strategy: {
    name: 'Стратегия',
    emoji: '⚔️',
    description: 'Тактические сражения с множеством юнитов'
  }
};

interface GameMode {
  arena_type: string;
  count: number;
  activeGames: number;
  totalPlayers: number;
}

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch all arenas to build game modes
  const { data: arenas, isLoading, error } = useQuery({
    queryKey: ['arenas-for-games'],
    queryFn: async () => {
      const response = await api.getArenas({ limit: 1000 });
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch live stats for active games
  const { data: liveStats } = useQuery({
    queryKey: ['stats', 'live'],
    queryFn: async () => {
      const response = await fetch('https://api.giperarena.space/api/v1/stats/live');
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  // Group arenas by type to create game modes
  const gameModes: GameMode[] = arenas
    ? Object.entries(
        arenas.reduce((acc: Record<string, any[]>, arena: any) => {
          const type = arena.arena_type || 'other';
          if (!acc[type]) acc[type] = [];
          acc[type].push(arena);
          return acc;
        }, {})
      ).map(([type, arenasOfType]) => ({
        arena_type: type,
        count: arenasOfType.length,
        activeGames: arenasOfType.filter((a: any) => a.status === 'active').length,
        totalPlayers: arenasOfType.reduce((sum: number, a: any) => sum + (a.total_games || 0), 0),
      }))
    : [];

  const filteredModes = gameModes.filter(mode => {
    const info = ARENA_TYPE_INFO[mode.arena_type];
    if (!info) return false;

    const matchesSearch = info.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || mode.arena_type === selectedType;
    return matchesSearch && matchesType;
  });

  const allTypes = Array.from(new Set(gameModes.map(m => m.arena_type)));

  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple mb-4">
            Игровые режимы
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Выбирайте из различных режимов игры и соревнуйтесь с игроками по всему миру за призы и славу
          </p>
          {liveStats && (
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span><span className="font-bold">{liveStats.gamesActive}</span> активных игр</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon size={14} className="text-cyan-400" />
                <span><span className="font-bold">{liveStats.playersOnline}</span> игроков онлайн</span>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-hover p-6">
                <Skeleton className="h-16 w-16 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <GamepadIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ошибка загрузки</h3>
            <p className="text-muted-foreground mb-4">
              Не удалось загрузить игровые режимы
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && !error && filteredModes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModes.map((mode) => {
              const info = ARENA_TYPE_INFO[mode.arena_type];
              if (!info) return null;

              return (
                <Link
                  key={mode.arena_type}
                  href={`/arenas?arena_type=${mode.arena_type}`}
                >
                  <Card className="glass-hover hover-lift cursor-pointer group h-full">
                    <div className="p-6 space-y-4">
                      {/* Game Icon & Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-xl flex items-center justify-center text-4xl">
                            {info.emoji}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">
                              {info.name}
                            </h3>
                            <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {mode.count} {mode.count === 1 ? 'арена' : 'арен'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {info.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <PlayIcon size={16} className="text-cyan-400" />
                          <span>{mode.activeGames} активных</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrophyIcon size={16} className="text-yellow-400" />
                          <span>{mode.totalPlayers} игр</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="neon"
                          size="sm"
                          className="group-hover:scale-105 transition-transform w-full"
                        >
                          <PlayIcon size={14} className="mr-1" />
                          Играть сейчас
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredModes.length === 0 && (
          <div className="text-center py-16">
            <GamepadIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Игровые режимы не найдены</h3>
            <p className="text-muted-foreground mb-4">
              На данный момент нет доступных арен с этим типом игры
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedType(null);
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
