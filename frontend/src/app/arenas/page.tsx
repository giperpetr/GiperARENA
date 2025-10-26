'use client';


import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock data
const MOCK_ARENAS = [
  {
    id: '1',
    name: 'Tokyo Cyber Arena',
    location: 'Tokyo, Japan',
    game_type: 'drone_racing',
    status: 'active',
    rating: 4.8,
    total_sessions: 1234,
    hourly_rate: 50,
    image: '🏯',
  },
  {
    id: '2',
    name: 'New York Battle Zone',
    location: 'New York, USA',
    game_type: 'robot_combat',
    status: 'active',
    rating: 4.9,
    total_sessions: 2456,
    hourly_rate: 75,
    image: '🗽',
  },
  {
    id: '3',
    name: 'Berlin Tech Arena',
    location: 'Berlin, Germany',
    game_type: 'drone_racing',
    status: 'active',
    rating: 4.7,
    total_sessions: 987,
    hourly_rate: 60,
    image: '🏛️',
  },
  {
    id: '4',
    name: 'Moscow Robotics Hub',
    location: 'Moscow, Russia',
    game_type: 'crawler_challenge',
    status: 'active',
    rating: 4.6,
    total_sessions: 756,
    hourly_rate: 45,
    image: '🏰',
  },
  {
    id: '5',
    name: 'Dubai Future Arena',
    location: 'Dubai, UAE',
    game_type: 'robot_combat',
    status: 'maintenance',
    rating: 4.9,
    total_sessions: 3210,
    hourly_rate: 100,
    image: '🕌',
  },
  {
    id: '6',
    name: 'London Gaming District',
    location: 'London, UK',
    game_type: 'drone_racing',
    status: 'active',
    rating: 4.8,
    total_sessions: 1890,
    hourly_rate: 65,
    image: '🏴',
  },
];

const GAME_TYPES = {
  drone_racing: 'Гонки дронов',
  robot_combat: 'Бои роботов',
  crawler_challenge: 'Гусеничные машины',
};

export default function ArenasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredArenas = MOCK_ARENAS.filter((arena) => {
    const matchesSearch =
      arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arena.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || arena.game_type === selectedType;
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
                    <div className="text-5xl">{arena.image}</div>
                    <Badge variant={arena.status === 'active' ? 'success' : 'warning'}>
                      {arena.status === 'active' ? 'Активна' : 'Обслуживание'}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-gradient-cyan-purple transition-all">
                    {arena.name}
                  </CardTitle>
                  <CardDescription>📍 {arena.location}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="font-bold">{arena.rating}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {arena.total_sessions.toLocaleString()} игр
                    </div>
                  </div>

                  {/* Game Type */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {GAME_TYPES[arena.game_type as keyof typeof GAME_TYPES]}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Цена за час</p>
                      <p className="text-lg font-bold text-primary">{arena.hourly_rate} PAC</p>
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
