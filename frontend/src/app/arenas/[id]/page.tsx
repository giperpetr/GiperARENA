import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ArenaDetailClient from './ArenaDetailClient';

// Mock data
const MOCK_ARENA = {
  id: '1',
  name: 'Tokyo Cyber Arena',
  location: 'Tokyo, Japan',
  country: 'Japan',
  city: 'Tokyo',
  game_type: 'drone_racing',
  status: 'active',
  rating: 4.8,
  total_sessions: 1234,
  hourly_rate: 50,
  pricing_model: 'hourly',
  description:
    'Футуристическая арена в самом сердце Токио. Оснащена последними технологиями для гонок дронов с препятствиями и ультра-низкой задержкой передачи данных.',
  features: ['4K камеры', 'WebRTC <50ms', '5G connectivity', 'Препятствия', 'Ночной режим'],
  operator: {
    name: 'Tech Gaming Inc.',
    verified: true,
  },
  devices: [
    { id: '1', name: 'Drone Alpha', status: 'available', image: '🚁' },
    { id: '2', name: 'Drone Beta', status: 'in_use', image: '🚁' },
    { id: '3', name: 'Drone Gamma', status: 'available', image: '🚁' },
  ],
};

const RECENT_SESSIONS = [
  { player: 'Player123', score: 9850, time: '2m 45s', timestamp: '5 минут назад' },
  { player: 'DroneKing', score: 9720, time: '2m 52s', timestamp: '12 минут назад' },
  { player: 'SkyMaster', score: 9650, time: '2m 58s', timestamp: '28 минут назад' },
];

export default async function ArenaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const arenaId = resolvedParams.id;

  // In future, fetch arena data from API based on arenaId
  // const arena = await fetchArena(arenaId);

  return (
    <div className="min-h-screen bg-background">
      {/* Arena Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/arenas" className="hover:text-primary transition-colors">
              Арены
            </Link>
            <span>/</span>
            <span>{MOCK_ARENA.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gradient-cyan-purple">
                  {MOCK_ARENA.name}
                </h1>
                {MOCK_ARENA.operator.verified && (
                  <Badge variant="success">✓ Верифицирована</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{MOCK_ARENA.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-bold text-foreground">{MOCK_ARENA.rating}</span>
                  <span>({MOCK_ARENA.total_sessions} игр)</span>
                </div>
                <Badge variant={MOCK_ARENA.status === 'active' ? 'success' : 'warning'}>
                  {MOCK_ARENA.status === 'active' ? 'Активна' : 'Обслуживание'}
                </Badge>
              </div>

              <p className="text-muted-foreground max-w-2xl">{MOCK_ARENA.description}</p>
            </div>

            <ArenaDetailClient arena={MOCK_ARENA} recentSessions={RECENT_SESSIONS} />
          </div>
        </div>
      </section>
    </div>
  );
}
