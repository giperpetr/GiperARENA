'use client';

import { useEffect, useState } from 'react';
import { MOCK_LIVE_STATS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import {
  UsersIcon,
  GamepadIcon,
  TrophyIcon,
  CoinsIcon,
  EyeIcon,
  ChevronLeftIcon,
  XIcon,
  ActivityIcon
} from '@/components/ui/icons';

export function LiveStatsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    playersOnline: 0,
    gamesActive: 0,
    tournamentsLive: 0,
    totalPrizePool: 0,
    totalViewers: 0,
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  // Animate counters on mount
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        playersOnline: Math.floor(MOCK_LIVE_STATS.playersOnline * progress),
        gamesActive: Math.floor(MOCK_LIVE_STATS.gamesActive * progress),
        tournamentsLive: Math.floor(MOCK_LIVE_STATS.tournamentsLive * progress),
        totalPrizePool: Math.floor(MOCK_LIVE_STATS.totalPrizePool * progress),
        totalViewers: Math.floor(MOCK_LIVE_STATS.totalViewers * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats(MOCK_LIVE_STATS);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        playersOnline: prev.playersOnline + Math.floor(Math.random() * 10 - 5),
        gamesActive: prev.gamesActive + Math.floor(Math.random() * 5 - 2),
        tournamentsLive: prev.tournamentsLive,
        totalPrizePool: prev.totalPrizePool,
        totalViewers: prev.totalViewers + Math.floor(Math.random() * 20 - 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Trigger Button - Fixed on right edge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 z-40 hidden xl:flex items-center justify-center w-8 h-20 bg-gradient-to-l from-cyan-600/90 to-purple-600/90 backdrop-blur-lg hover:from-cyan-500/90 hover:to-purple-500/90 transition-all rounded-l-lg shadow-lg group"
          aria-label="Open Live Stats"
        >
          <ChevronLeftIcon className="text-white group-hover:scale-110 transition-transform" size={20} />
        </button>
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-24 right-0 w-56 z-40 hidden xl:block transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden shadow-2xl h-[calc(100vh-7rem)]">
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <ActivityIcon size={16} className="text-cyan-400" />
                Live Stats
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Stats Content */}
          <div className="p-3 space-y-3 overflow-y-auto h-[calc(100%-8rem)]">
            {/* Players Online */}
            <div className="group hover:bg-cyan-500/5 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Players Online</span>
                <UsersIcon className="text-cyan-400" size={16} />
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatNumber(animatedStats.playersOnline)}
              </div>
              <div className="h-1 bg-border/30 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Games Active */}
            <div className="group hover:bg-purple-500/5 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Games Active</span>
                <GamepadIcon className="text-purple-400" size={16} />
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatNumber(animatedStats.gamesActive)}
              </div>
              <div className="h-1 bg-border/30 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-pulse"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            {/* Tournaments Live */}
            <div className="group hover:bg-cyan-500/5 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Tournaments Live</span>
                <TrophyIcon className="text-cyan-400" size={16} />
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatNumber(animatedStats.tournamentsLive)}
              </div>
              <div className="h-1 bg-border/30 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                />
              </div>
            </div>

            {/* Total Prize Pool */}
            <div className="group hover:bg-purple-500/5 p-2 rounded-lg transition-colors border border-transparent hover:border-purple-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Total Prize Pool</span>
                <CoinsIcon className="text-purple-400" size={16} />
              </div>
              <div className="text-xl font-bold text-cyan-400">
                {formatCurrency(animatedStats.totalPrizePool)}
              </div>
              <div className="h-1 bg-border/30 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full animate-pulse"
                  style={{ width: '90%' }}
                />
              </div>
            </div>

            {/* Total Viewers */}
            <div className="group hover:bg-cyan-500/5 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Total Viewers</span>
                <EyeIcon className="text-cyan-400" size={16} />
              </div>
              <div className="text-xl font-bold text-foreground">
                {formatNumber(animatedStats.totalViewers)}
              </div>
              <div className="h-1 bg-border/30 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full animate-pulse"
                  style={{ width: '70%' }}
                />
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-background/80 backdrop-blur-sm border-t border-border/50 text-center">
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>
        </Card>
      </div>
    </>
  );
}
