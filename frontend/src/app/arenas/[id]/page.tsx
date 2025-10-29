import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ArenaDetailClient from './ArenaDetailClient';
import { api } from '@/lib/api-client';

// Recent sessions mock data (will be fetched from API in future)
const RECENT_SESSIONS = [
  { player: 'Player123', score: 9850, time: '2m 45s', timestamp: '5 минут назад' },
  { player: 'DroneKing', score: 9720, time: '2m 52s', timestamp: '12 минут назад' },
  { player: 'SkyMaster', score: 9650, time: '2m 58s', timestamp: '28 минут назад' },
];

export default async function ArenaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const arenaId = resolvedParams.id;

  // Fetch arena data from API
  let arena;
  try {
    arena = await api.getArenaById(arenaId);
  } catch (error) {
    console.error('Failed to fetch arena:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Арена не найдена</h1>
          <Link href="/arenas" className="text-primary hover:underline">
            Вернуться к списку арен
          </Link>
        </div>
      </div>
    );
  }

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
            <span>{arena.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gradient-cyan-purple">
                  {arena.name}
                </h1>
                {arena.verified && (
                  <Badge variant="success">✓ Верифицирована</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{arena.location_address || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-bold text-foreground">{arena.rating || '4.5'}</span>
                  <span>({arena.total_games || 0} игр)</span>
                </div>
                <Badge variant={arena.status === 'active' ? 'success' : 'warning'}>
                  {arena.status === 'active' ? 'Активна' : 'Обслуживание'}
                </Badge>
              </div>

              <p className="text-muted-foreground max-w-2xl">{arena.description}</p>
            </div>

            <ArenaDetailClient arena={arena} recentSessions={RECENT_SESSIONS} />
          </div>
        </div>
      </section>
    </div>
  );
}
