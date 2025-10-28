'use client';

import { useEffect, useState } from 'react';
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
  const [stats, setStats] = useState({
    totalPrizePool: 2450000,
    activeGames: 156,
    playersOnline: 47234,
    weeklyTournaments: 24,
  });

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeGames: Math.max(100, prev.activeGames + Math.floor(Math.random() * 10 - 5)),
        playersOnline: Math.max(40000, prev.playersOnline + Math.floor(Math.random() * 100 - 50)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const statsData: Stat[] = [
    {
      icon: <CoinsIcon size={32} className="text-cyan-400" />,
      label: 'Призовой фонд месяца',
      value: formatCurrency(stats.totalPrizePool),
      trend: '+12%',
      color: 'from-cyan-500/20 to-cyan-600/20',
    },
    {
      icon: <GamepadIcon size={32} className="text-purple-400" />,
      label: 'Активных игр',
      value: stats.activeGames.toString(),
      trend: 'live',
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      icon: <UsersIcon size={32} className="text-blue-400" />,
      label: 'Игроков онлайн',
      value: formatNumber(stats.playersOnline),
      trend: 'online',
      color: 'from-blue-500/20 to-blue-600/20',
    },
    {
      icon: <TrophyIcon size={32} className="text-pink-400" />,
      label: 'Турниров на этой неделе',
      value: stats.weeklyTournaments.toString(),
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
