'use client';

import { MOCK_NEWS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, ChatIcon, ClockIcon } from '@/components/ui/icons';

export function NewsSection() {
  const news = MOCK_NEWS.slice(0, 5);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement':
        return 'bg-cyan-600';
      case 'update':
        return 'bg-cyan-600';
      case 'tournament':
        return 'bg-purple-600';
      case 'arena':
        return 'bg-purple-600';
      default:
        return 'bg-cyan-600';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Latest News</h2>

      <div className="space-y-3">
        {news.map((item) => (
          <Card
            key={item.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group cursor-pointer"
          >
            <div className="flex gap-4 p-4">
              {/* News Image */}
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center text-4xl relative overflow-hidden">
                {item.image}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>

              {/* News Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`${getCategoryColor(item.category)} border-0 text-xs uppercase flex-shrink-0`}>
                    {item.category}
                  </Badge>
                  <span className="text-xs text-white/50 flex-shrink-0 flex items-center gap-1">
                    <ClockIcon size={12} />
                    {item.timeAgo}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 mb-3 line-clamp-1">
                  {item.subtitle}
                </p>

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <EyeIcon size={16} className="text-cyan-400" />
                    <span>{formatNumber(item.views)} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChatIcon size={16} className="text-purple-400" />
                    <span>{formatNumber(item.comments)} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View All News Button */}
      <div className="mt-4 text-center">
        <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors">
          View All News →
        </button>
      </div>
    </div>
  );
}
