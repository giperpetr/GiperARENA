'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data
const MOCK_TOURNAMENTS = [
  {
    id: '1',
    name: 'Tokyo Spring Championship',
    arena: 'Tokyo Cyber Arena',
    tournament_type: 'single_elimination',
    status: 'upcoming',
    start_date: '2025-02-15T10:00:00Z',
    max_participants: 16,
    current_participants: 12,
    prize_pool: 10000,
    entry_fee: 100,
    game_type: 'drone_racing',
  },
  {
    id: '2',
    name: 'European Robot League',
    arena: 'Berlin Tech Arena',
    tournament_type: 'round_robin',
    status: 'active',
    start_date: '2025-01-20T14:00:00Z',
    max_participants: 8,
    current_participants: 8,
    prize_pool: 5000,
    entry_fee: 50,
    game_type: 'robot_combat',
  },
  {
    id: '3',
    name: 'Dubai Masters Series',
    arena: 'Dubai Future Arena',
    tournament_type: 'double_elimination',
    status: 'upcoming',
    start_date: '2025-02-20T16:00:00Z',
    max_participants: 32,
    current_participants: 28,
    prize_pool: 25000,
    entry_fee: 250,
    game_type: 'drone_racing',
  },
  {
    id: '4',
    name: 'NYC Crawler Challenge',
    arena: 'New York Battle Zone',
    tournament_type: 'swiss',
    status: 'upcoming',
    start_date: '2025-02-10T18:00:00Z',
    max_participants: 16,
    current_participants: 9,
    prize_pool: 8000,
    entry_fee: 80,
    game_type: 'crawler_challenge',
  },
  {
    id: '5',
    name: 'World Championship Finals',
    arena: 'Multiple Arenas',
    tournament_type: 'single_elimination',
    status: 'completed',
    start_date: '2025-01-01T12:00:00Z',
    max_participants: 64,
    current_participants: 64,
    prize_pool: 100000,
    entry_fee: 500,
    game_type: 'drone_racing',
  },
];

const TOURNAMENT_TYPES = {
  single_elimination: 'Олимпийская система',
  double_elimination: 'Двойная олимпийская',
  round_robin: 'Круговая',
  swiss: 'Швейцарская',
};

const STATUS_LABELS = {
  upcoming: 'Скоро',
  active: 'Идёт сейчас',
  completed: 'Завершён',
};

export default function TournamentsPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredTournaments = MOCK_TOURNAMENTS.filter((t) => {
    if (!filter) return true;
    return t.status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-5xl font-bold">
              <span className="text-gradient-neon">Турниры</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Соревнуйся с лучшими игроками и выигрывай крупные призы
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 border-b border-border/40 glass backdrop-blur-xl py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <Button
              variant={filter === null ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setFilter(null)}
            >
              Все
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Предстоящие
            </Button>
            <Button
              variant={filter === 'active' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Активные
            </Button>
            <Button
              variant={filter === 'completed' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Завершённые
            </Button>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTournaments.map((tournament) => {
              const spotsLeft = tournament.max_participants - tournament.current_participants;
              const isFull = spotsLeft === 0;

              return (
                <Card key={tournament.id} glow className="hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge
                          variant={
                            tournament.status === 'active'
                              ? 'success'
                              : tournament.status === 'upcoming'
                                ? 'neon'
                                : 'outline'
                          }
                          className="mb-2"
                        >
                          {STATUS_LABELS[tournament.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                        {tournament.status === 'active' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span>LIVE</span>
                          </div>
                        )}
                      </div>
                      <div className="text-2xl">🏆</div>
                    </div>

                    <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                    <CardDescription>📍 {tournament.arena}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tournament Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Тип турнира</p>
                        <p className="font-semibold">
                          {TOURNAMENT_TYPES[tournament.tournament_type as keyof typeof TOURNAMENT_TYPES]}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Старт</p>
                        <p className="font-semibold">
                          {new Date(tournament.start_date).toLocaleDateString('ru-RU', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Участники</span>
                        <span className="font-semibold">
                          {tournament.current_participants}/{tournament.max_participants}
                        </span>
                      </div>
                      <div className="h-2 bg-space-border-gray rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{
                            width: `${(tournament.current_participants / tournament.max_participants) * 100}%`,
                          }}
                        />
                      </div>
                      {spotsLeft > 0 && spotsLeft <= 5 && (
                        <p className="text-xs text-warning mt-1">
                          Осталось мест: {spotsLeft}
                        </p>
                      )}
                    </div>

                    {/* Prize & Entry */}
                    <div className="flex items-end justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Призовой фонд</p>
                        <p className="text-2xl font-bold text-primary">
                          {tournament.prize_pool.toLocaleString()} PAC
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Взнос</p>
                        <p className="text-lg font-bold">{tournament.entry_fee} PAC</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant={tournament.status === 'active' ? 'secondary' : 'neon'}
                      className="w-full"
                      disabled={isFull || tournament.status === 'completed'}
                      asChild={tournament.status !== 'completed'}
                    >
                      {tournament.status === 'completed' ? (
                        <span>Завершён</span>
                      ) : tournament.status === 'active' ? (
                        <Link href={`/tournaments/${tournament.id}`}>Смотреть</Link>
                      ) : isFull ? (
                        <span>Мест нет</span>
                      ) : (
                        <Link href={`/tournaments/${tournament.id}`}>Регистрация</Link>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-2">Турниры не найдены</h3>
              <p className="text-muted-foreground mb-6">Измени фильтры</p>
              <Button variant="outline" onClick={() => setFilter(null)}>
                Показать все
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-12 bg-space-dark-gray">
        <div className="container mx-auto px-4">
          <Card glow className="glass text-center">
            <CardHeader>
              <CardTitle className="text-3xl">
                <span className="text-gradient-cyan-purple">Организуй свой турнир</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Создай турнир и установи правила
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="neon" size="lg">
                Создать турнир
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
