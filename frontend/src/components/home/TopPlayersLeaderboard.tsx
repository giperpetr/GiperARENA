'use client';

import { MOCK_TOP_PLAYERS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrophyIcon, StarIcon } from '@/components/ui/icons';

export function TopPlayersLeaderboard() {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatEarnings = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S+':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0';
      case 'S':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0';
      case 'A+':
        return 'bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0';
      case 'A':
        return 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white border-0';
      case 'B+':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0';
      case 'B':
        return 'bg-gradient-to-r from-blue-300 to-blue-400 text-white border-0';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-0';
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-cyan-400 font-extrabold text-xl';
    if (rank === 2) return 'text-purple-300 font-bold text-lg';
    if (rank === 3) return 'text-cyan-300 font-bold text-lg';
    return 'text-white/80 font-semibold';
  };

  const topPlayers = MOCK_TOP_PLAYERS.slice(0, 10);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Top Players Leaderboard</h2>

      <Card className="bg-white/5 backdrop-blur-lg border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Rank</th>
                <th className="text-left p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Player</th>
                <th className="text-left p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Tier</th>
                <th className="text-right p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Rating</th>
                <th className="text-right p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Wins</th>
                <th className="text-right p-4 text-sm font-bold text-white/80 uppercase tracking-wider">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr
                  key={player.rank}
                  className="border-b border-white/5 hover:bg-white/10 transition-colors group"
                >
                  {/* Rank */}
                  <td className="p-4">
                    <div className={`${getRankStyle(player.rank)} flex items-center justify-center w-8`}>
                      {player.rank === 1 && <TrophyIcon size={24} />}
                      {player.rank === 2 && <StarIcon size={22} />}
                      {player.rank === 3 && <StarIcon size={20} />}
                      {player.rank > 3 && player.rank}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-full flex items-center justify-center text-xl border-2 border-white/20">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {player.name}
                        </div>
                        <div className="text-xs text-white/50">{player.country}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="p-4">
                    <Badge className={`${getTierColor(player.tier)} font-bold px-3 py-1 shadow-lg`}>
                      {player.tier}
                    </Badge>
                  </td>

                  {/* Rating */}
                  <td className="p-4 text-right">
                    <div className="font-bold text-white text-lg">{formatNumber(player.rating)}</div>
                  </td>

                  {/* Wins */}
                  <td className="p-4 text-right">
                    <div className="text-green-400 font-semibold">{formatNumber(player.wins)}</div>
                  </td>

                  {/* Earnings */}
                  <td className="p-4 text-right">
                    <div className="text-cyan-400 font-bold">{formatEarnings(player.earnings)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View All Button */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors">
            View Full Leaderboard →
          </button>
        </div>
      </Card>
    </div>
  );
}
