'use client';

import { MOCK_TOURNAMENTS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoinsIcon, UsersIcon, ClockIcon } from '@/components/ui/icons';

export function TrendingTournaments() {
  const formatPrize = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-cyan-500';
      case 'registration':
        return 'bg-purple-600';
      case 'finished':
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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Trending Tournaments</h2>

      <div className="space-y-3">
        {MOCK_TOURNAMENTS.map((tournament) => (
          <Card
            key={tournament.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className={`w-12 h-12 rounded-lg ${getRankBadgeColor(tournament.rank)} flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg`}>
                  #{tournament.rank}
                </div>

                {/* Tournament Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {tournament.image}
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
                      {tournament.format}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1.5">
                      <CoinsIcon className="text-cyan-400" size={16} />
                      <span className="font-bold text-cyan-400">{formatPrize(tournament.prizePool)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="text-purple-400" size={16} />
                      <span>{tournament.playerCount} players</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="text-blue-400" size={16} />
                      <span>{tournament.daysLeft} days left</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {tournament.status === 'registration' && (
                    <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-xs px-4 py-1 h-8 border-0">
                      REGISTER
                    </Button>
                  )}
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs px-4 py-1 h-8">
                    VIEW BRACKET
                  </Button>
                  {tournament.status === 'active' && (
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-4 py-1 h-8 border-0">
                      WATCH
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
