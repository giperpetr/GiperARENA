'use client';

import { MOCK_HIGHLIGHTS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, UserIcon, HeartIcon } from '@/components/ui/icons';

export function CommunityHighlights() {
  const highlights = MOCK_HIGHLIGHTS.slice(0, 8);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'epic':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'funny':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'skill':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'fail':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Community Highlights</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((highlight) => (
          <Card
            key={highlight.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group cursor-pointer"
          >
            {/* Video Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

              {/* Category Badge */}
              <Badge className={`absolute top-2 left-2 ${getCategoryColor(highlight.category)} text-xs uppercase font-bold shadow-lg`}>
                {highlight.category}
              </Badge>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs text-white font-semibold">
                {highlight.duration}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <PlayIcon className="text-gray-900 ml-1" size={20} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                {highlight.title}
              </h3>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-white/70 truncate">
                  <UserIcon size={14} className="flex-shrink-0" />
                  <span className="truncate">{highlight.playerName}</span>
                </div>
                <div className="flex items-center gap-1 text-pink-400 font-semibold flex-shrink-0">
                  <HeartIcon size={14} />
                  <span>{formatNumber(highlight.likes)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 text-center">
        <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors">
          View All Highlights →
        </button>
      </div>
    </div>
  );
}
