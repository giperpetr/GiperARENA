'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

const GAME_TYPES = {
  drone_racing: 'Гонки дронов',
  robot_combat: 'Бои роботов',
  crawler_challenge: 'Гусеничные машины',
};

const ARENA_EMOJIS: Record<string, string> = {
  'Moscow Battle Arena': '🏰',
  'London Drone Circuit': '🏴',
  'Tokyo Gaming Arena': '🏯',
  'Berlin Tech Zone': '🏛️',
  'Dubai Future Arena': '🕌',
};

export default function ArenasPage() {
  const [arenas, setArenas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadArenas() {
      try {
        setLoading(true);
        const data = await api.getArenas();
        setArenas(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load arenas:', err);
        setError('Не удалось загрузить список арен');
      } finally {
        setLoading(false);
      }
    }

    loadArenas();
  }, []);

  const filteredArenas = arenas.filter((arena) => {
    const matchesSearch =
      arena.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arena.location_address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || arena.arena_type === selectedType;
    const matchesStatus = !selectedStatus || arena.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-5xl font-bold">
              <span className="text-gradient-cyan-purple">Арены мира</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Выбери арену и начни управлять реальными устройствами прямо сейчас
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-b border-border/40 glass backdrop-blur-xl py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Поиск по названию или городу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === null ? 'neon' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                Все типы
              </Button>
              <Button
                variant={selectedType === 'drone_racing' ? 'neon' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('drone_racing')}
              >
                Дроны
              </Button>
              <Button
                variant={selectedType === 'robot_combat' ? 'neon' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('robot_combat')}
              >
                Роботы
              </Button>
              <Button
                variant={selectedType === 'crawler_challenge' ? 'neon' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('crawler_challenge')}
              >
                Гусеничные
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === null ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(null)}
              >
                Все
              </Button>
              <Button
                variant={selectedStatus === 'active' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('active')}
              >
                Активные
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Arena Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold mb-2">Загрузка арен...</h3>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-2">{error}</h3>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Повторить
              </Button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              {/* Results count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Найдено арен: <span className="font-bold text-foreground">{filteredArenas.length}</span>
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArenas.map((arena) => (
                  <Card key={arena.id} glow className="hover-lift group">
                    <CardHeader>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="text-5xl">{ARENA_EMOJIS[arena.name] || '🎮'}</div>
                        <Badge variant={arena.status === 'active' ? 'success' : 'warning'}>
                          {arena.status === 'active' ? 'Активна' : arena.status === 'maintenance' ? 'Обслуживание' : arena.status}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-gradient-cyan-purple transition-all">
                        {arena.name}
                      </CardTitle>
                      <CardDescription>📍 {arena.location_address || 'Не указано'}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span className="font-bold">
                            {arena.rating ? parseFloat(arena.rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {(arena.total_games || 0).toLocaleString()} игр
                        </div>
                      </div>

                      {/* Game Type */}
                      {arena.arena_type && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {GAME_TYPES[arena.arena_type as keyof typeof GAME_TYPES] || arena.arena_type}
                          </Badge>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Цена</p>
                          <p className="text-lg font-bold text-primary">
                            {arena.price_per_minute ? `${arena.price_per_minute} ${arena.currency || 'PAC'}/мин` : 'Уточняйте'}
                          </p>
                        </div>
                        <Button variant="neon" size="sm" asChild>
                          <Link href={`/arenas/${arena.id}`}>Играть</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredArenas.length === 0 && (
                <div className="py-20 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">Арены не найдены</h3>
                  <p className="text-muted-foreground mb-6">
                    Попробуй изменить параметры поиска
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType(null);
                      setSelectedStatus(null);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 py-12 bg-space-dark-gray">
        <div className="container mx-auto px-4">
          <Card glow className="glass text-center">
            <CardHeader>
              <CardTitle className="text-3xl">
                <span className="text-gradient-neon">Хочешь создать свою арену?</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Стань оператором и зарабатывай на игровых сессиях
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="neon" size="lg">
                Узнать больше
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
