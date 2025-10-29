'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { GameSession } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

export function LiveGamesCarousel() {
  const [liveSessions, setLiveSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemWidth = 320;
  const visibleItems = 4;

  useEffect(() => {
    async function fetchLiveSessions() {
      try {
        const sessions = await api.getGameSessions({ status: 'in_progress' as const, limit: 10 });
        setLiveSessions(sessions);
      } catch (error) {
        console.error('Failed to fetch live sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - itemWidth * 2));
  };

  const scrollRight = () => {
    const maxScroll = (liveSessions.length - visibleItems) * itemWidth;
    setScrollPosition(Math.min(maxScroll, scrollPosition + itemWidth * 2));
  };

  const formatViewerCount = (count: number) => {
    return count.toLocaleString();
  };

  const calculateDuration = (startTime?: string) => {
    if (!startTime) return '0:00';
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="relative w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Live Games</h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-[300px] h-[270px] bg-white/5 backdrop-blur-lg border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (liveSessions.length === 0) {
    return (
      <div className="relative w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Live Games</h2>
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
          <p className="text-white/60">No live games at the moment. Check back soon!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Live Games</h2>
        <div className="flex gap-2">
          <Button
            onClick={scrollLeft}
            disabled={scrollPosition === 0}
            className="w-10 h-10 p-0 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 disabled:opacity-30"
          >
            <ChevronLeftIcon size={20} className="text-white" />
          </Button>
          <Button
            onClick={scrollRight}
            disabled={scrollPosition >= (MOCK_LIVE_GAMES.length - visibleItems) * itemWidth}
            className="w-10 h-10 p-0 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 disabled:opacity-30"
          >
            <ChevronRightIcon size={20} className="text-white" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {liveSessions.map((session) => (
            <Card
              key={session.id}
              className="flex-shrink-0 w-[300px] bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <div className="relative">
                {/* Thumbnail */}
                <div className="w-full h-[170px] bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center text-6xl relative overflow-hidden">
                  🎮
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <Badge className="absolute top-3 left-3 bg-cyan-500 text-white border-0 animate-pulse flex items-center gap-1">
                    <PlayIcon size={12} className="text-white" />
                    LIVE
                  </Badge>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                    {calculateDuration(session.start_time)}
                  </div>
                  {session.control_latency_ms && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                      {session.control_latency_ms}ms
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">👤</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">Player {session.player_id.slice(0, 8)}</h3>
                      <p className="text-xs text-white/60 truncate">Arena {session.arena_id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300 uppercase">
                      {session.game_mode || 'gameplay'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <EyeIcon size={16} className="text-cyan-400" />
                      <span className="font-semibold">{Math.floor(Math.random() * 500) + 50}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
