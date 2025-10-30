'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Tournament } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoinsIcon, UsersIcon, ClockIcon } from '@/components/ui/icons';

export function TrendingTournaments() {
  // Fetch tournaments from API
  const { data: tournaments, isLoading, error } = useQuery({
    queryKey: ['tournaments', 'trending'],
    queryFn: async () => {
      const response = await api.getTournaments({ status: 'upcoming', limit: 3 });
      return response;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const formatPrize = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-cyan-500';
      case 'registration':
      case 'upcoming':
        return 'bg-purple-600';
      case 'completed':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-cyan-400 to-cyan-500 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-purple-400 to-purple-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white';
    return 'bg-white/10 text-white/80';
  };

  const getTournamentFormat = (type?: string) => {
    switch (type) {
      case 'single_elimination':
        return 'Single Elimination';
      case 'double_elimination':
        return 'Double Elimination';
      case 'round_robin':
        return 'Round Robin';
      case 'swiss':
        return 'Swiss System';
      default:
        return 'Tournament';
    }
  };

  const getDaysLeft = (startDate?: string) => {
    if (!startDate) return 'TBA';
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Loading state - Show 3 skeleton cards
  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Trending Tournaments</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              data-testid="tournament-skeleton"
              className="bg-white/5 backdrop-blur-lg border-white/10 animate-pulse"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10" />
                  <div className="w-16 h-16 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-white/10 rounded w-20" />
                      <div className="h-5 bg-white/10 rounded w-24" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-white/10 rounded w-16" />
                      <div className="h-4 bg-white/10 rounded w-20" />
                      <div className="h-4 bg-white/10 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Trending Tournaments</h2>
        <Card className="bg-red-500/10 border-red-500/20 p-6">
          <p className="text-red-400 text-center">
            Failed to load tournaments. Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Trending Tournaments</h2>
        <Card className="bg-white/5 border-white/10 p-8">
          <p className="text-white/60 text-center">
            No upcoming tournaments at the moment. Check back soon!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Trending Tournaments</h2>

      <div className="space-y-3">
        {tournaments.slice(0, 3).map((tournament: Tournament, index: number) => {
          const rank = (tournament.metadata?.rank as number) || index + 1;
          const image = (tournament.metadata?.image as string) || '🏆';
          const daysLeft = getDaysLeft(tournament.start_date);

          return (
            <Card
              key={tournament.id}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-lg ${getRankBadgeColor(rank)} flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg`}>
                    #{rank}
                  </div>

                  {/* Tournament Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {image}
                  </div>

                  {/* Tournament Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-purple-300 transition-colors">
                      {tournament.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={`${getStatusColor(tournament.status)} border-0 text-xs uppercase`}>
                        {tournament.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                        {getTournamentFormat(tournament.tournament_type)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1.5">
                        <CoinsIcon className="text-cyan-400" size={16} />
                        <span className="font-bold text-cyan-400">
                          {formatPrize(tournament.prize_pool || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="text-purple-400" size={16} />
                        <span>{tournament.current_participants} players</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="text-blue-400" size={16} />
                        <span>{daysLeft} days left</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {(tournament.status === 'registration' || tournament.status === 'upcoming') && (
                      <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-xs px-4 py-1 h-8 border-0">
                        REGISTER
                      </Button>
                    )}
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs px-4 py-1 h-8">
                      VIEW BRACKET
                    </Button>
                    {tournament.status === 'in_progress' && (
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-4 py-1 h-8 border-0">
                        WATCH
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
