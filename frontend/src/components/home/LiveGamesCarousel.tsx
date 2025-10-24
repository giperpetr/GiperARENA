'use client';

import { useState } from 'react';
import { MOCK_LIVE_GAMES } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

export function LiveGamesCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemWidth = 320;
  const visibleItems = 4;

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - itemWidth * 2));
  };

  const scrollRight = () => {
    const maxScroll = (MOCK_LIVE_GAMES.length - visibleItems) * itemWidth;
    setScrollPosition(Math.min(maxScroll, scrollPosition + itemWidth * 2));
  };

  const formatViewerCount = (count: number) => {
    return count.toLocaleString();
  };

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
          {MOCK_LIVE_GAMES.map((game) => (
            <Card
              key={game.id}
              className="flex-shrink-0 w-[300px] bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <div className="relative">
                {/* Thumbnail */}
                <div className="w-full h-[170px] bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center text-6xl relative overflow-hidden">
                  {game.thumbnail}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <Badge className="absolute top-3 left-3 bg-cyan-500 text-white border-0 animate-pulse flex items-center gap-1">
                    <PlayIcon size={12} className="text-white" />
                    LIVE
                  </Badge>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                    {game.streamDuration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{game.playerAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{game.playerName}</h3>
                      <p className="text-xs text-white/60 truncate">{game.arenaName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                      {game.gameType}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <EyeIcon size={16} className="text-cyan-400" />
                      <span className="font-semibold">{formatViewerCount(game.viewerCount)}</span>
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
