'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FireIcon,
  PlayIcon,
  EyeIcon,
  TrophyIcon,
  ClockIcon
} from '@/components/ui/icons';

const HIGHLIGHTS = [
  {
    id: 1,
    title: 'INSANE Last Second Victory!',
    game: 'Tank Battle Royale',
    emoji: '🚜',
    player: 'WarMachine_X',
    views: 125000,
    likes: 12500,
    duration: '2:45',
    date: '2 days ago',
    featured: true
  },
  {
    id: 2,
    title: 'World Record Speed Run',
    game: 'Drone Racing',
    emoji: '🚁',
    player: 'SkyRacer_99',
    views: 98000,
    likes: 9800,
    duration: '1:30',
    date: '5 days ago',
    featured: false
  },
  {
    id: 3,
    title: '1v5 Clutch - Impossible Win',
    game: 'Robot Arena Battle',
    emoji: '🤖',
    player: 'CyberKnight_77',
    views: 156000,
    likes: 15600,
    duration: '3:15',
    date: '1 week ago',
    featured: false
  },
  {
    id: 4,
    title: 'Perfect Parkour - No Mistakes',
    game: 'Parkour Runner',
    emoji: '🏃',
    player: 'SpeedDemon_13',
    views: 67000,
    likes: 6700,
    duration: '1:52',
    date: '1 week ago',
    featured: false
  },
  {
    id: 5,
    title: 'Epic Comeback from 0-3',
    game: 'Tank Battle Royale',
    emoji: '🚜',
    player: 'TankMaster_42',
    views: 89000,
    likes: 8900,
    duration: '4:20',
    date: '2 weeks ago',
    featured: false
  },
  {
    id: 6,
    title: 'New Meta Strategy Revealed',
    game: 'Strategic Command',
    emoji: '⚔️',
    player: 'TacticalGenius',
    views: 134000,
    likes: 13400,
    duration: '5:10',
    date: '3 weeks ago',
    featured: false
  }
];

export default function HighlightsPage() {
  const featuredHighlight = HIGHLIGHTS.find(h => h.featured) || HIGHLIGHTS[0];
  const otherHighlights = HIGHLIGHTS.filter(h => !h.featured);

  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FireIcon size={48} className="text-orange-500" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple">
              Highlights
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Watch the most epic moments, world records, and incredible plays from the community
          </p>
        </div>

        {/* Featured Highlight */}
        <Card className="glass-hover mb-10 overflow-hidden group cursor-pointer">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="relative aspect-video md:aspect-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-red-900/30 flex items-center justify-center text-9xl">
                {featuredHighlight.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Featured Badge */}
              <Badge className="absolute top-4 left-4 bg-orange-500 text-white flex items-center gap-1.5 px-3 py-1">
                <FireIcon size={14} />
                FEATURED
              </Badge>

              {/* Views */}
              <div className="absolute top-4 right-4 glass text-white flex items-center gap-2 px-3 py-1 rounded-full">
                <EyeIcon size={16} />
                <span className="font-bold">{(featuredHighlight.views / 1000).toFixed(0)}K</span>
              </div>

              {/* Duration */}
              <Badge className="absolute bottom-4 right-4 bg-black/80 text-white border-0">
                {featuredHighlight.duration}
              </Badge>

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <PlayIcon size={40} className="text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Highlight Info */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                    {featuredHighlight.title}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {featuredHighlight.player[0]}
                    </div>
                    <span className="font-medium text-white">{featuredHighlight.player}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <PlayIcon size={16} className="text-cyan-400" />
                    <span className="text-muted-foreground">{featuredHighlight.game}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon size={16} className="text-purple-400" />
                    <span className="text-muted-foreground">{featuredHighlight.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <EyeIcon size={18} className="text-muted-foreground" />
                    <span className="font-bold text-white">{featuredHighlight.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrophyIcon size={18} className="text-yellow-400" />
                    <span className="font-bold text-white">{featuredHighlight.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button variant="neon" size="lg" className="w-full mt-4">
                <PlayIcon size={18} className="mr-2" />
                Watch Highlight
              </Button>
            </div>
          </div>
        </Card>

        {/* Popular Highlights */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FireIcon size={24} className="text-orange-500" />
          Popular This Week
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherHighlights.map((highlight) => (
            <Card
              key={highlight.id}
              className="glass-hover hover-lift cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-orange-900/30 to-red-900/30 flex items-center justify-center text-6xl rounded-t-lg overflow-hidden">
                  <span>{highlight.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Duration */}
                  <Badge className="absolute bottom-3 right-3 bg-black/80 text-white border-0 text-xs">
                    {highlight.duration}
                  </Badge>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <PlayIcon size={24} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Highlight Info */}
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {highlight.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {highlight.player[0]}
                      </div>
                      <span className="text-sm text-muted-foreground">{highlight.player}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <EyeIcon size={12} />
                        {(highlight.views / 1000).toFixed(0)}K
                      </div>
                      <div className="flex items-center gap-1">
                        <TrophyIcon size={12} className="text-yellow-400" />
                        {(highlight.likes / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <span className="text-muted-foreground">{highlight.date}</span>
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
