'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlayIcon,
  UsersIcon,
  EyeIcon,
  TrophyIcon,
  ArenaIcon
} from '@/components/ui/icons';

const LIVE_GAMES = [
  {
    id: 1,
    arena: 'Arena Tokyo #3',
    game: 'Robot Arena Battle',
    emoji: '🤖',
    player: 'CyberKnight_77',
    viewers: 1248,
    duration: '5:32',
    prize: '$500',
    status: 'live'
  },
  {
    id: 2,
    arena: 'Arena Moscow #1',
    game: 'Drone Racing',
    emoji: '🚁',
    player: 'SkyRacer_99',
    viewers: 892,
    duration: '3:15',
    prize: '$350',
    status: 'live'
  },
  {
    id: 3,
    arena: 'Arena Dubai #5',
    game: 'Tank Battle',
    emoji: '🚜',
    player: 'WarMachine_X',
    viewers: 2105,
    duration: '8:47',
    prize: '$800',
    status: 'live'
  },
  {
    id: 4,
    arena: 'Arena Berlin #2',
    game: 'Parkour Runner',
    emoji: '🏃',
    player: 'SpeedDemon_13',
    viewers: 567,
    duration: '2:08',
    prize: '$250',
    status: 'live'
  }
];

export default function LiveGamesPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple">
              Live Games
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Watch players control real devices in arenas around the world in real-time
          </p>
        </div>

        {/* Live Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {LIVE_GAMES.map((game) => (
            <Card
              key={game.id}
              className="glass-hover hover-lift cursor-pointer group relative overflow-hidden"
            >
              {/* Live Badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-red-500 text-white flex items-center gap-1.5 px-3 py-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </Badge>
              </div>

              {/* Viewers Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="glass text-white flex items-center gap-1.5 px-3 py-1">
                  <EyeIcon size={14} />
                  {game.viewers.toLocaleString()}
                </Badge>
              </div>

              <div className="p-6 space-y-4">
                {/* Game Preview / Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-lg flex items-center justify-center text-8xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="relative z-10">{game.emoji}</span>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <PlayIcon size={32} className="text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration */}
                  <Badge className="absolute bottom-3 right-3 bg-black/60 text-white border-0">
                    {game.duration}
                  </Badge>
                </div>

                {/* Game Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">
                      {game.game}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <ArenaIcon size={14} className="text-purple-400" />
                      <span>{game.arena}</span>
                    </div>
                  </div>

                  {/* Player & Prize */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {game.player[0]}
                      </div>
                      <span className="text-white font-medium">{game.player}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                      <TrophyIcon size={16} />
                      {game.prize}
                    </div>
                  </div>
                </div>

                {/* Watch Button */}
                <Button variant="neon" className="w-full group-hover:scale-105 transition-transform">
                  <PlayIcon size={16} className="mr-2" />
                  Watch Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {LIVE_GAMES.length}
            </div>
            <div className="text-sm text-muted-foreground">Live Sessions</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {LIVE_GAMES.reduce((acc, game) => acc + game.viewers, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Viewers</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              $1,900
            </div>
            <div className="text-sm text-muted-foreground">Prize Pool Active</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">Always Online</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
