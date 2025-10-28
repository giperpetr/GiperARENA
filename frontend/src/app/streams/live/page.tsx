'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EyeIcon,
  PlayIcon,
  UsersIcon,
  TrophyIcon
} from '@/components/ui/icons';

const LIVE_STREAMS = [
  {
    id: 1,
    streamer: 'ProGamer_Elite',
    title: 'Championship Finals - Tank Battle',
    game: 'Tank Battle Royale',
    emoji: '🚜',
    viewers: 3542,
    duration: '2:15:30',
    category: 'Tournament'
  },
  {
    id: 2,
    streamer: 'RacingMaster_X',
    title: 'Speed Records Attempt',
    game: 'Drone Racing',
    emoji: '🚁',
    viewers: 1897,
    duration: '1:45:12',
    category: 'Speedrun'
  },
  {
    id: 3,
    streamer: 'TechWizard_99',
    title: 'Teaching Beginner Tactics',
    game: 'Robot Arena Battle',
    emoji: '🤖',
    viewers: 892,
    duration: '0:52:08',
    category: 'Tutorial'
  },
  {
    id: 4,
    streamer: 'NightRider_77',
    title: 'Late Night Ranked Grind',
    game: 'Parkour Runner',
    emoji: '🏃',
    viewers: 567,
    duration: '3:22:45',
    category: 'Casual'
  }
];

export default function LiveStreamsPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple">
              Live Streams
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Watch top players stream their gameplay, learn tactics, and join the community
          </p>
        </div>

        {/* Featured Stream */}
        <Card className="glass-hover mb-10 overflow-hidden group cursor-pointer">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stream Preview */}
            <div className="relative aspect-video md:aspect-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 flex items-center justify-center text-9xl">
                {LIVE_STREAMS[0].emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Live Badge */}
              <Badge className="absolute top-4 left-4 bg-red-500 text-white flex items-center gap-1.5 px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>

              {/* Viewers */}
              <div className="absolute top-4 right-4 glass text-white flex items-center gap-2 px-3 py-1 rounded-full">
                <EyeIcon size={16} />
                <span className="font-bold">{LIVE_STREAMS[0].viewers.toLocaleString()}</span>
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <PlayIcon size={40} className="text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  FEATURED
                </Badge>
                <div>
                  <h2 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                    {LIVE_STREAMS[0].title}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {LIVE_STREAMS[0].streamer[0]}
                    </div>
                    <span className="font-medium text-white">{LIVE_STREAMS[0].streamer}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <PlayIcon size={16} className="text-cyan-400" />
                    <span className="text-muted-foreground">{LIVE_STREAMS[0].game}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrophyIcon size={16} className="text-purple-400" />
                    <span className="text-muted-foreground">{LIVE_STREAMS[0].category}</span>
                  </div>
                </div>
              </div>

              <Button variant="neon" size="lg" className="w-full mt-4">
                <PlayIcon size={18} className="mr-2" />
                Watch Stream
              </Button>
            </div>
          </div>
        </Card>

        {/* Other Live Streams */}
        <h2 className="text-2xl font-bold text-white mb-6">Other Live Streams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIVE_STREAMS.slice(1).map((stream) => (
            <Card
              key={stream.id}
              className="glass-hover hover-lift cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Stream Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-cyan-900/30 to-purple-900/30 flex items-center justify-center text-6xl rounded-t-lg overflow-hidden">
                  <span>{stream.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Live Badge */}
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white flex items-center gap-1 px-2 py-0.5 text-xs">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </Badge>

                  {/* Viewers */}
                  <Badge className="absolute top-3 right-3 glass text-white flex items-center gap-1 px-2 py-0.5 text-xs">
                    <EyeIcon size={12} />
                    {stream.viewers.toLocaleString()}
                  </Badge>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <PlayIcon size={24} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {stream.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {stream.streamer[0]}
                      </div>
                      <span className="text-sm text-muted-foreground">{stream.streamer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stream.game}</span>
                    <Badge variant="outline" className="text-xs">{stream.category}</Badge>
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
