'use client';

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const MOCK_TOURNAMENT = {
  id: '1',
  name: 'Tokyo Cyber Championship 2025',
  description: 'Престижный турнир по дрон-рейсингу с призовым фондом 50,000 PAC',
  status: 'active',
  prize_pool: 50000,
  entry_fee: 500,
  max_participants: 32,
  current_participants: 32,
  start_date: '2025-01-15T10:00:00Z',
  arena: 'Tokyo Cyber Arena',
  game_type: 'drone_racing',
  format: 'Single Elimination',
  organizer: 'ArenaHUB',
};

const MOCK_BRACKET: Round[] = [
  {
    round: 1,
    name: '1/16 Finals',
    matches: [
      { id: '1', player1: 'DroneKing_Tokyo', player2: 'SkyRacer_Moscow', winner: 'DroneKing_Tokyo', score: '3-1', status: 'completed' },
      { id: '2', player1: 'CyberPilot_NY', player2: 'NeonDriver_LA', winner: 'CyberPilot_NY', score: '3-2', status: 'completed' },
      { id: '3', player1: 'ProGamer_Seoul', player2: 'TechWizard', winner: 'ProGamer_Seoul', score: '3-0', status: 'completed' },
      { id: '4', player1: 'RacingLegend', player2: 'QuantumRacer', winner: 'RacingLegend', score: '3-1', status: 'completed' },
      { id: '5', player1: 'SpeedDemon_Paris', player2: 'NeonNinja', winner: 'SpeedDemon_Paris', score: '3-2', status: 'completed' },
      { id: '6', player1: 'ArenaChampion', player2: 'RobotMaster_Berlin', winner: 'ArenaChampion', score: '3-0', status: 'completed' },
      { id: '7', player1: 'CosmicRacer', player2: 'ElectricDreamer', winner: 'CosmicRacer', score: '3-1', status: 'completed' },
      { id: '8', player1: 'VelocityKing', player2: 'TurboFlyer', winner: 'VelocityKing', score: '3-2', status: 'completed' },
    ],
  },
  {
    round: 2,
    name: 'Quarter Finals',
    matches: [
      { id: '9', player1: 'DroneKing_Tokyo', player2: 'CyberPilot_NY', winner: 'DroneKing_Tokyo', score: '3-0', status: 'completed' },
      { id: '10', player1: 'ProGamer_Seoul', player2: 'RacingLegend', winner: 'ProGamer_Seoul', score: '3-1', status: 'completed' },
      { id: '11', player1: 'SpeedDemon_Paris', player2: 'ArenaChampion', winner: null, score: null, status: 'in_progress' },
      { id: '12', player1: 'CosmicRacer', player2: 'VelocityKing', winner: null, score: null, status: 'pending' },
    ],
  },
  {
    round: 3,
    name: 'Semi Finals',
    matches: [
      { id: '13', player1: 'DroneKing_Tokyo', player2: 'ProGamer_Seoul', winner: null, score: null, status: 'pending' },
      { id: '14', player1: null, player2: null, winner: null, score: null, status: 'pending' },
    ],
  },
  {
    round: 4,
    name: 'Grand Final',
    matches: [
      { id: '15', player1: null, player2: null, winner: null, score: null, status: 'pending' },
    ],
  },
];

const MOCK_PARTICIPANTS = [
  { rank: 1, username: 'DroneKing_Tokyo', avatar: '👑', seed: 1, status: 'active' },
  { rank: 2, username: 'CyberPilot_NY', avatar: '🎮', seed: 2, status: 'eliminated' },
  { rank: 3, username: 'ProGamer_Seoul', avatar: '⚡', seed: 3, status: 'active' },
  { rank: 4, username: 'RacingLegend', avatar: '🌟', seed: 4, status: 'eliminated' },
  { rank: 5, username: 'SpeedDemon_Paris', avatar: '😈', seed: 5, status: 'active' },
  { rank: 6, username: 'ArenaChampion', avatar: '🏆', seed: 6, status: 'active' },
  { rank: 7, username: 'CosmicRacer', avatar: '🔬', seed: 7, status: 'active' },
  { rank: 8, username: 'VelocityKing', avatar: '👾', seed: 8, status: 'active' },
];

export default function TournamentDetailPage({ params }: any) {
  const participationPercentage = (MOCK_TOURNAMENT.current_participants / MOCK_TOURNAMENT.max_participants) * 100;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/tournaments" className="hover:text-primary">
            Турниры
          </a>
          <span>/</span>
          <span className="text-foreground">{MOCK_TOURNAMENT.name}</span>
        </div>

        {/* Tournament Header */}
        <Card glow className="glass mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex gap-2">
                  <Badge variant="neon">
                    {MOCK_TOURNAMENT.status === 'upcoming' ? 'Скоро' :
                     MOCK_TOURNAMENT.status === 'active' ? 'Активен' : 'Завершен'}
                  </Badge>
                  <Badge variant="outline">
                    {MOCK_TOURNAMENT.format}
                  </Badge>
                  <Badge variant="outline">
                    🚁 Дрон рейсинг
                  </Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{MOCK_TOURNAMENT.name}</CardTitle>
                <CardDescription className="text-base">
                  {MOCK_TOURNAMENT.description}
                </CardDescription>
              </div>
              <Button variant="neon" size="lg" disabled={MOCK_TOURNAMENT.current_participants >= MOCK_TOURNAMENT.max_participants}>
                {MOCK_TOURNAMENT.current_participants >= MOCK_TOURNAMENT.max_participants ? 'Мест нет' : 'Зарегистрироваться'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Призовой фонд</div>
                <div className="text-2xl font-bold text-primary">
                  {MOCK_TOURNAMENT.prize_pool.toLocaleString()} PAC
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Взнос</div>
                <div className="text-2xl font-bold text-secondary">
                  {MOCK_TOURNAMENT.entry_fee.toLocaleString()} PAC
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Участников</div>
                <div className="text-2xl font-bold text-neon-cyan">
                  {MOCK_TOURNAMENT.current_participants}/{MOCK_TOURNAMENT.max_participants}
                </div>
                <div className="mt-2 h-2 rounded-full bg-space-medium-gray overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${participationPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Арена</div>
                <div className="text-lg font-bold">{MOCK_TOURNAMENT.arena}</div>
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
                <CardDescription>Single Elimination - 32 участника</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex gap-8 min-w-max py-4">
                    {MOCK_BRACKET.map((round) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Участники турнира</CardTitle>
                <CardDescription>
                  {MOCK_TOURNAMENT.current_participants} зарегистрированных игроков
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_PARTICIPANTS.map((participant) => (
                    <div
                      key={participant.username}
                      className="flex items-center justify-between rounded-lg border border-border/40 p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-space-medium-gray text-2xl">
                          {participant.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{participant.username}</div>
                          <div className="text-sm text-muted-foreground">
                            Seed #{participant.seed}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={participant.status === 'active' ? 'neon' : 'outline'}
                      >
                        {participant.status === 'active' ? 'Активен' : 'Выбыл'}
                      </Badge>
                    </div>
                  ))}
                  <div className="text-center py-4">
                    <Button variant="outline">
                      Показать всех участников
                    </Button>
                  </div>
                </div>
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
                    <li>• Single Elimination (одиночное выбывание)</li>
                    <li>• 32 участника, сетка из 5 раундов</li>
                    <li>• Все матчи до 3 побед (Best of 5)</li>
                    <li>• Финал проходит в формате Best of 7</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Призовые места</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <span className="font-medium">🥇 1 место</span>
                      <span className="text-primary font-bold">25,000 PAC</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-gray-400/10 border border-gray-400/30">
                      <span className="font-medium">🥈 2 место</span>
                      <span className="text-primary font-bold">15,000 PAC</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <span className="font-medium">🥉 3-4 места</span>
                      <span className="text-primary font-bold">5,000 PAC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Общие правила</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Взнос за участие: {MOCK_TOURNAMENT.entry_fee} PAC (невозвратный)</li>
                    <li>• Опоздание на матч более 10 минут = дисквалификация</li>
                    <li>• Использование багов и читов запрещено</li>
                    <li>• Все устройства должны соответствовать техническим требованиям</li>
                    <li>• Решение судей является окончательным</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Технические требования</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Только сертифицированные дроны класса Racing</li>
                    <li>• Максимальная скорость: 120 км/ч</li>
                    <li>• Вес: 250-500 грамм</li>
                    <li>• FPV камера обязательна</li>
                    <li>• Модификации в рамках правил арены</li>
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-2">⚠️ Важно</h3>
                  <p className="text-xs text-muted-foreground">
                    Регистрируясь на турнир, вы подтверждаете, что прочитали и согласны
                    со всеми правилами. Нарушение правил может привести к дисквалификации
                    без возврата взноса.
                  </p>
                </div>

                <Button variant="neon" className="w-full" size="lg">
                  Зарегистрироваться на турнир
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
