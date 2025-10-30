'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Tournament } from '@/types';

const TOURNAMENT_TYPES = {
  single_elimination: 'Олимпийская система',
  double_elimination: 'Двойная олимпийская',
  round_robin: 'Круговая',
  swiss: 'Швейцарская',
};

const STATUS_LABELS = {
  upcoming: 'Скоро',
  registration: 'Регистрация',
  in_progress: 'Идёт сейчас',
  active: 'Идёт сейчас',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

// Map filter values to API status values
const FILTER_TO_STATUS: Record<string, string> = {
  'upcoming': 'upcoming',
  'active': 'in_progress',
  'completed': 'completed',
};

export default function TournamentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch tournaments with React Query
  const { data: tournaments, isLoading, error } = useQuery<Tournament[]>({
    queryKey: ['tournaments', selectedStatus],
    queryFn: async () => {
      const filters: any = {};
      if (selectedStatus !== 'all') {
        filters.status = FILTER_TO_STATUS[selectedStatus] || selectedStatus;
      }
      const response = await api.getTournaments(filters);
      return response;
    },
    refetchInterval: 60000, // Refresh every minute for live updates
  });

  return (
    <div className="min-h-screen bg-background">
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
              variant={selectedStatus === 'all' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Все
            </Button>
            <Button
              variant={selectedStatus === 'upcoming' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('upcoming')}
            >
              Предстоящие
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('active')}
            >
              Активные
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'neon' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
            >
              Завершённые
            </Button>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} glow>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-2">Ошибка загрузки</h3>
              <p className="text-muted-foreground mb-6">
                Не удалось загрузить турниры. Попробуйте обновить страницу.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Обновить страницу
              </Button>
            </div>
          )}

          {/* Tournaments Grid */}
          {!isLoading && !error && tournaments && tournaments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tournaments.map((tournament) => {
                const spotsLeft = (tournament.max_participants || 0) - (tournament.current_participants || 0);
                const isFull = spotsLeft === 0 && !!tournament.max_participants;
                const progressPercent = tournament.max_participants
                  ? (tournament.current_participants / tournament.max_participants) * 100
                  : 0;
                const isLive = tournament.status === 'in_progress';

                return (
                  <Card key={tournament.id} glow className="hover-lift">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge
                            variant={
                              isLive
                                ? 'success'
                                : tournament.status === 'upcoming' || tournament.status === 'registration'
                                  ? 'neon'
                                  : 'outline'
                            }
                            className="mb-2"
                          >
                            {STATUS_LABELS[tournament.status as keyof typeof STATUS_LABELS] || tournament.status}
                          </Badge>
                          {isLive && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span>LIVE</span>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl">🏆</div>
                      </div>

                      <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                      <CardDescription>
                        📍 {tournament.metadata?.arena_name || 'TBA'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Tournament Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Тип турнира</p>
                          <p className="font-semibold">
                            {tournament.tournament_type
                              ? TOURNAMENT_TYPES[tournament.tournament_type as keyof typeof TOURNAMENT_TYPES] || tournament.tournament_type
                              : 'Не указан'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Старт</p>
                          <p className="font-semibold">
                            {tournament.start_date
                              ? new Date(tournament.start_date).toLocaleDateString('ru-RU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'TBA'}
                          </p>
                        </div>
                      </div>

                      {/* Participants */}
                      {tournament.max_participants && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Участники</span>
                            <span className="font-semibold">
                              {tournament.current_participants || 0}/{tournament.max_participants}
                            </span>
                          </div>
                          <div className="h-2 bg-space-border-gray rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{
                                width: `${progressPercent}%`,
                              }}
                            />
                          </div>
                          {spotsLeft > 0 && spotsLeft <= 5 && (
                            <p className="text-xs text-warning mt-1">
                              Осталось мест: {spotsLeft}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Prize & Entry */}
                      <div className="flex items-end justify-between border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Призовой фонд</p>
                          <p className="text-2xl font-bold text-primary">
                            {tournament.prize_pool ? Number(tournament.prize_pool).toLocaleString() : '0'} PAC
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Взнос</p>
                          <p className="text-lg font-bold">
                            {tournament.entry_fee ? Number(tournament.entry_fee) : '0'} PAC
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant={isLive ? 'secondary' : 'neon'}
                        className="w-full"
                        disabled={
                          isFull ||
                          tournament.status === 'completed' ||
                          tournament.status === 'cancelled'
                        }
                        asChild={
                          tournament.status !== 'completed' &&
                          tournament.status !== 'cancelled' &&
                          !isFull
                        }
                      >
                        {tournament.status === 'completed' ? (
                          <span>Завершён</span>
                        ) : tournament.status === 'cancelled' ? (
                          <span>Отменён</span>
                        ) : isLive ? (
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
          )}

          {/* Empty State */}
          {!isLoading && !error && tournaments && tournaments.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-2">Турниры не найдены</h3>
              <p className="text-muted-foreground mb-6">
                {selectedStatus === 'all'
                  ? 'На данный момент турниры отсутствуют'
                  : 'Измените фильтры для просмотра других турниров'}
              </p>
              {selectedStatus !== 'all' && (
                <Button variant="outline" onClick={() => setSelectedStatus('all')}>
                  Показать все
                </Button>
              )}
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
