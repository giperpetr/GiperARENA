'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api-client';
import type { Tournament } from '@/types';

interface Match {
  id: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
  score: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Round {
  round: number;
  name: string;
  matches: Match[];
}

interface Participant {
  rank: number;
  username: string;
  avatar: string;
  seed: number;
  status: 'active' | 'eliminated';
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Resolve params Promise (Next.js 15 requirement)
  useEffect(() => {
    params.then(resolvedParams => {
      setTournamentId(resolvedParams.id);
    });
  }, [params]);

  // Fetch tournament details
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useQuery<Tournament>({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      const response = await api.getTournamentById(tournamentId!);
      return response;
    },
    enabled: !!tournamentId,
  });

  // Fetch bracket data
  const { data: bracket, isLoading: bracketLoading } = useQuery<Round[]>({
    queryKey: ['tournament', tournamentId, 'bracket'],
    queryFn: async () => {
      try {
        const response = await api.getTournamentBracket(tournamentId!);
        // Response might be wrapped in { data } or direct array
        return Array.isArray(response) ? response : (response as any).data || [];
      } catch (error) {
        console.error('Failed to fetch bracket:', error);
        return [];
      }
    },
    enabled: !!tournamentId,
  });

  // Fetch participants
  const { data: participants, isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ['tournament', tournamentId, 'participants'],
    queryFn: async () => {
      try {
        const response = await api.getTournamentParticipants(tournamentId!);
        // Response might be wrapped in { data } or direct array
        return Array.isArray(response) ? response : (response as any).data || [];
      } catch (error) {
        console.error('Failed to fetch participants:', error);
        return [];
      }
    },
    enabled: !!tournamentId,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      return await api.registerForTournament(tournamentId!);
    },
    onSuccess: () => {
      // Refetch tournament data
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId, 'participants'] });
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
    },
  });

  // Loading state
  if (!tournamentId || tournamentLoading) {
    return (
      <main className="min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card glow className="glass mb-8">
            <CardHeader>
              <Skeleton className="h-10 w-96 mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Error state
  if (tournamentError || !tournament) {
    return (
      <main className="min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold mb-4">Турнир не найден</h1>
          <p className="text-muted-foreground mb-6">Возможно, турнир был удален или ID неверный</p>
          <Button variant="neon" onClick={() => window.location.href = '/tournaments'}>
            Вернуться к турнирам
          </Button>
        </div>
      </main>
    );
  }

  const participationPercentage = tournament.max_participants
    ? (tournament.current_participants / tournament.max_participants) * 100
    : 0;

  const isFull = tournament.max_participants
    ? tournament.current_participants >= tournament.max_participants
    : false;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/tournaments" className="hover:text-primary">
            Турниры
          </a>
          <span>/</span>
          <span className="text-foreground">{tournament.name}</span>
        </div>

        {/* Tournament Header */}
        <Card glow className="glass mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex gap-2">
                  <Badge variant="neon">
                    {tournament.status === 'upcoming' ? 'Скоро' :
                     tournament.status === 'registration' ? 'Регистрация' :
                     tournament.status === 'in_progress' ? 'Активен' :
                     tournament.status === 'completed' ? 'Завершен' : 'Отменен'}
                  </Badge>
                  <Badge variant="outline">
                    {tournament.tournament_type === 'single_elimination' ? 'Single Elimination' :
                     tournament.tournament_type === 'double_elimination' ? 'Double Elimination' :
                     tournament.tournament_type === 'round_robin' ? 'Round Robin' : 'Swiss'}
                  </Badge>
                  {tournament.metadata?.game_type && (
                    <Badge variant="outline">
                      {tournament.metadata.game_type === 'drone_racing' ? '🚁 Дрон рейсинг' : tournament.metadata.game_type}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{tournament.name}</CardTitle>
                <CardDescription className="text-base">
                  {tournament.description || 'Описание отсутствует'}
                </CardDescription>
              </div>
              <Button
                variant="neon"
                size="lg"
                disabled={isFull || registerMutation.isPending || tournament.status !== 'registration'}
                onClick={() => registerMutation.mutate()}
              >
                {registerMutation.isPending ? 'Регистрация...' :
                 isFull ? 'Мест нет' :
                 tournament.status !== 'registration' ? 'Регистрация закрыта' :
                 'Зарегистрироваться'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Призовой фонд</div>
                <div className="text-2xl font-bold text-primary">
                  {tournament.prize_pool?.toLocaleString() || '0'} PAC
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Взнос</div>
                <div className="text-2xl font-bold text-secondary">
                  {tournament.entry_fee?.toLocaleString() || '0'} PAC
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Участников</div>
                <div className="text-2xl font-bold text-neon-cyan">
                  {tournament.current_participants}/{tournament.max_participants || '∞'}
                </div>
                {tournament.max_participants && (
                  <div className="mt-2 h-2 rounded-full bg-space-medium-gray overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ width: `${participationPercentage}%` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Арена</div>
                <div className="text-lg font-bold">{tournament.metadata?.arena_name || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="bracket" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bracket">Турнирная сетка</TabsTrigger>
            <TabsTrigger value="participants">Участники</TabsTrigger>
            <TabsTrigger value="rules">Правила</TabsTrigger>
          </TabsList>

          {/* Bracket Tab */}
          <TabsContent value="bracket">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Турнирная сетка</CardTitle>
                <CardDescription>
                  {tournament.tournament_type === 'single_elimination' ? 'Single Elimination' : tournament.tournament_type} - {tournament.current_participants} участников
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bracketLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : bracket && bracket.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="flex gap-8 min-w-max py-4">
                      {bracket.map((round) => (
                        <div key={round.round} className="flex flex-col gap-4 min-w-[300px]">
                          {/* Round Header */}
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-gradient-cyan-purple">
                              {round.name}
                            </h3>
                          </div>

                          {/* Matches */}
                          <div className="space-y-8">
                            {round.matches.map((match) => (
                              <Card
                                key={match.id}
                                className={`border-2 ${
                                  match.status === 'in_progress'
                                    ? 'border-primary/50 bg-primary/5'
                                    : match.status === 'completed'
                                      ? 'border-border/40'
                                      : 'border-border/20 opacity-60'
                                }`}
                              >
                                <CardContent className="p-4 space-y-2">
                                  {/* Player 1 */}
                                  <div
                                    className={`flex items-center justify-between rounded p-2 ${
                                      match.winner === match.player1
                                        ? 'bg-primary/10 border border-primary/30'
                                        : 'bg-space-medium-gray/30'
                                    }`}
                                  >
                                    <span className="text-sm font-medium">
                                      {match.player1 || 'TBD'}
                                    </span>
                                    {match.score && match.winner === match.player1 && (
                                      <Badge variant="neon" className="text-xs">WIN</Badge>
                                    )}
                                  </div>

                                  {/* VS or Score */}
                                  <div className="text-center text-xs text-muted-foreground">
                                    {match.status === 'in_progress' ? (
                                      <Badge variant="outline" className="text-xs">🔴 LIVE</Badge>
                                    ) : match.score ? (
                                      <span className="font-mono">{match.score}</span>
                                    ) : (
                                      'VS'
                                    )}
                                  </div>

                                  {/* Player 2 */}
                                  <div
                                    className={`flex items-center justify-between rounded p-2 ${
                                      match.winner === match.player2
                                        ? 'bg-primary/10 border border-primary/30'
                                        : 'bg-space-medium-gray/30'
                                    }`}
                                  >
                                    <span className="text-sm font-medium">
                                      {match.player2 || 'TBD'}
                                    </span>
                                    {match.score && match.winner === match.player2 && (
                                      <Badge variant="neon" className="text-xs">WIN</Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Турнирная сетка еще не сформирована</p>
                    <p className="text-sm mt-2">Ожидайте начала турнира</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Участники турнира</CardTitle>
                <CardDescription>
                  {tournament.current_participants} зарегистрированных игроков
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participantsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : participants && participants.length > 0 ? (
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div
                        key={participant.username}
                        className="flex items-center justify-between rounded-lg border border-border/40 p-4 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-space-medium-gray text-2xl">
                            {participant.avatar || '👤'}
                          </div>
                          <div>
                            <div className="font-medium">{participant.username}</div>
                            {participant.seed && (
                              <div className="text-sm text-muted-foreground">
                                Seed #{participant.seed}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={participant.status === 'active' ? 'neon' : 'outline'}
                        >
                          {participant.status === 'active' ? 'Активен' : 'Выбыл'}
                        </Badge>
                      </div>
                    ))}
                    {participants.length > 8 && (
                      <div className="text-center py-4">
                        <Button variant="outline">
                          Показать всех участников
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Участников пока нет</p>
                    <p className="text-sm mt-2">Станьте первым!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Правила турнира</CardTitle>
                <CardDescription>Внимательно прочитайте перед регистрацией</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Формат турнира</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {tournament.tournament_type === 'single_elimination' ? 'Single Elimination (одиночное выбывание)' : tournament.tournament_type}</li>
                    <li>• {tournament.max_participants || '∞'} участников</li>
                    {tournament.rules?.match_format && (
                      <li>• {tournament.rules.match_format}</li>
                    )}
                    {tournament.rules?.final_format && (
                      <li>• {tournament.rules.final_format}</li>
                    )}
                  </ul>
                </div>

                {tournament.prize_distribution && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Призовые места</h3>
                    <div className="space-y-2">
                      {Object.entries(tournament.prize_distribution).map(([place, amount]) => (
                        <div key={place} className="flex justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <span className="font-medium">{place}</span>
                          <span className="text-primary font-bold">{amount} PAC</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Общие правила</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Взнос за участие: {tournament.entry_fee || 0} PAC (невозвратный)</li>
                    <li>• Опоздание на матч более 10 минут = дисквалификация</li>
                    <li>• Использование багов и читов запрещено</li>
                    <li>• Все устройства должны соответствовать техническим требованиям</li>
                    <li>• Решение судей является окончательным</li>
                  </ul>
                </div>

                {tournament.rules?.technical_requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Технические требования</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {Object.entries(tournament.rules.technical_requirements).map(([key, value]) => (
                        <li key={key}>• {String(value)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-2">⚠️ Важно</h3>
                  <p className="text-xs text-muted-foreground">
                    Регистрируясь на турнир, вы подтверждаете, что прочитали и согласны
                    со всеми правилами. Нарушение правил может привести к дисквалификации
                    без возврата взноса.
                  </p>
                </div>

                <Button
                  variant="neon"
                  className="w-full"
                  size="lg"
                  disabled={isFull || registerMutation.isPending || tournament.status !== 'registration'}
                  onClick={() => registerMutation.mutate()}
                >
                  {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться на турнир'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
