'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { CoinsIcon, GamepadIcon, UsersIcon, TrophyIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
}

export function QuickStatsBanner() {
  // Fetch live stats from API
  const { data: liveStats, isLoading, error } = useQuery({
    queryKey: ['stats', 'live'],
    queryFn: async () => {
      const response = await fetch('https://api.giperarena.space/api/v1/stats/live');
      if (!response.ok) {
        throw new Error('Failed to fetch live stats');
      }
      const json = await response.json();
      return json.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalPrizePool: 0,
    activeGames: 0,
    playersOnline: 0,
    weeklyTournaments: 0,
  });

  // Animate stats when data loads
  useEffect(() => {
    if (liveStats) {
      setAnimatedStats({
        totalPrizePool: liveStats.totalPrizePool || 0,
        activeGames: liveStats.gamesActive || 0,
        playersOnline: liveStats.playersOnline || 0,
        weeklyTournaments: liveStats.tournamentsLive || 0,
      });
    }
  }, [liveStats]);

  // Simulate real-time updates between API calls
  useEffect(() => {
    if (!liveStats) return;

    const interval = setInterval(() => {
      setAnimatedStats((prev) => ({
        ...prev,
        activeGames: Math.max(0, prev.activeGames + Math.floor(Math.random() * 10 - 5)),
        playersOnline: Math.max(0, prev.playersOnline + Math.floor(Math.random() * 100 - 50)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [liveStats]);

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Show loading state with skeleton values
  const displayStats = isLoading || error ? {
    totalPrizePool: 0,
    activeGames: 0,
    playersOnline: 0,
    weeklyTournaments: 0,
  } : animatedStats;

  const statsData: Stat[] = [
    {
      icon: <CoinsIcon size={32} className="text-cyan-400" />,
      label: 'Призовой фонд месяца',
      value: isLoading ? '...' : formatCurrency(displayStats.totalPrizePool),
      trend: '+12%',
      color: 'from-cyan-500/20 to-cyan-600/20',
    },
    {
      icon: <GamepadIcon size={32} className="text-purple-400" />,
      label: 'Активных игр',
      value: isLoading ? '...' : displayStats.activeGames.toString(),
      trend: 'live',
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      icon: <UsersIcon size={32} className="text-blue-400" />,
      label: 'Игроков онлайн',
      value: isLoading ? '...' : formatNumber(displayStats.playersOnline),
      trend: 'online',
      color: 'from-blue-500/20 to-blue-600/20',
    },
    {
      icon: <TrophyIcon size={32} className="text-pink-400" />,
      label: 'Турниров на этой неделе',
      value: isLoading ? '...' : displayStats.weeklyTournaments.toString(),
      trend: '+3',
      color: 'from-pink-500/20 to-pink-600/20',
    },
  ];

  return (
    <section className="relative px-6 py-12 border-b border-border/20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className={cn(
                'group relative overflow-hidden',
                'bg-white/5 backdrop-blur-lg border-white/10',
                'hover:bg-white/10 hover:border-white/20',
                'transition-all duration-300',
                'cursor-pointer'
              )}
            >
              {/* Gradient background */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                stat.color
              )} />

              <div className="relative p-6">
                {/* Icon */}
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>

                {/* Label */}
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  {stat.label}
                </p>

                {/* Value */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>

                  {/* Trend badge */}
                  {stat.trend && (
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      stat.trend === 'live' && 'bg-cyan-500/20 text-cyan-400 animate-pulse',
                      stat.trend === 'online' && 'bg-blue-500/20 text-blue-400',
                      stat.trend.startsWith('+') && 'bg-green-500/20 text-green-400'
                    )}>
                      {stat.trend}
                    </span>
                  )}
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
