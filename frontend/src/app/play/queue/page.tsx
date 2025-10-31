'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClockIcon,
  UsersIcon,
  GamepadIcon,
  TrophyIcon,
  PlayIcon,
  XIcon
} from '@/components/ui/icons';
import { api } from '@/lib/api-client';

const MOCK_QUEUE_STATUS = {
  position: 3,
  totalInQueue: 15,
  estimatedWait: '2 min 30 sec',
  selectedGame: 'Robot Arena Battle'
};

const ARENA_TYPE_INFO: Record<string, { name: string; emoji: string }> = {
  combat: { name: 'Robot Arena Battle', emoji: '🤖' },
  racing: { name: 'Drone Racing', emoji: '🚁' },
  crawler: { name: 'Crawler Challenge', emoji: '🕷️' },
  tank: { name: 'Tank Battle', emoji: '🚜' },
  parkour: { name: 'Parkour Run', emoji: '🏃' },
  strategy: { name: 'Strategy Warfare', emoji: '⚔️' },
};

interface GameMode {
  id: string;
  arena_type: string;
  name: string;
  emoji: string;
  players: number;
  avgWait: string;
  arenaCount: number;
}

export default function QueuePage() {
  const [inQueue, setInQueue] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [countdown, setCountdown] = useState(150); // 2 min 30 sec

  // Fetch all arenas to build game modes
  const { data: arenas, isLoading: arenasLoading } = useQuery({
    queryKey: ['arenas-for-queue'],
    queryFn: async () => {
      const response = await api.getArenas({ limit: 1000, status: 'active' });
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch live stats for active games count
  const { data: liveStats } = useQuery({
    queryKey: ['stats', 'live'],
    queryFn: async () => {
      const response = await fetch('https://api.giperarena.space/api/v1/stats/live');
      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Group arenas by type to create game modes
  const gameModes: GameMode[] = arenas
    ? Object.entries(
        arenas.reduce((acc: Record<string, any[]>, arena: any) => {
          const type = arena.arena_type || 'other';
          if (!acc[type]) acc[type] = [];
          acc[type].push(arena);
          return acc;
        }, {})
      )
        .filter(([type]) => ARENA_TYPE_INFO[type]) // Only known types
        .map(([type, arenasOfType]) => {
          const info = ARENA_TYPE_INFO[type];
          const activeCount = arenasOfType.filter((a: any) => a.status === 'active').length;
          // Estimate players in queue based on active arenas (mock calculation)
          const estimatedPlayers = Math.floor(activeCount * 2.5 + Math.random() * 5);
          const avgWaitMinutes = Math.ceil(estimatedPlayers / Math.max(activeCount, 1));

          return {
            id: type,
            arena_type: type,
            name: info.name,
            emoji: info.emoji,
            players: estimatedPlayers,
            avgWait: `${avgWaitMinutes} min`,
            arenaCount: activeCount,
          };
        })
    : [];

  useEffect(() => {
    if (!inQueue) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setInQueue(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inQueue]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinQueue = (mode: GameMode) => {
    setSelectedMode(mode);
    setInQueue(true);
  };

  const handleLeaveQueue = () => {
    setInQueue(false);
    setSelectedMode(null);
    setCountdown(150);
  };

  const isLoading = arenasLoading;

  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple mb-4">
            Game Queue
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join a queue and wait for your turn to control a real device in the arena
          </p>
        </div>

        {/* Queue Status - Active */}
        {inQueue && selectedMode && (
          <Card className="glass mb-10 p-8 border-cyan-500/30">
            <div className="text-center space-y-6">
              {/* Status Badge */}
              <Badge className="bg-cyan-500 text-white text-sm px-4 py-1">
                IN QUEUE
              </Badge>

              {/* Game Info */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">{selectedMode.emoji}</span>
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-white">{selectedMode.name}</h2>
                  <p className="text-muted-foreground">Waiting for available slot...</p>
                </div>
              </div>

              {/* Queue Position */}
              <div className="glass rounded-lg p-6 max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-5xl font-bold text-cyan-400 mb-2">
                      {MOCK_QUEUE_STATUS.position}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Position</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold text-purple-400 mb-2">
                      {MOCK_QUEUE_STATUS.totalInQueue}
                    </div>
                    <div className="text-sm text-muted-foreground">Total in Queue</div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="space-y-2">
                <div className="text-6xl font-bold text-gradient-cyan-purple">
                  {formatTime(countdown)}
                </div>
                <p className="text-muted-foreground">Estimated wait time</p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                    style={{
                      width: `${((150 - countdown) / 150) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Leave Queue Button */}
              <Button
                variant="outline"
                onClick={handleLeaveQueue}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <XIcon size={16} className="mr-2" />
                Leave Queue
              </Button>
            </div>
          </Card>
        )}

        {/* Available Game Modes */}
        {!inQueue && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Available Game Modes</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass p-6">
                    <Skeleton className="h-20 w-20 rounded-xl mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))}
              </div>
            ) : gameModes.length === 0 ? (
              <Card className="glass p-12 text-center">
                <GamepadIcon size={64} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  No game modes available at the moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back soon or visit our arenas page
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameModes.map((mode) => (
                  <Card
                    key={mode.id}
                    className="glass-hover hover-lift cursor-pointer group"
                  >
                    <div className="p-6 space-y-4">
                      {/* Mode Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-xl flex items-center justify-center text-5xl mx-auto">
                        {mode.emoji}
                      </div>

                      {/* Mode Name */}
                      <div className="text-center">
                        <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors mb-2">
                          {mode.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {mode.arenaCount} {mode.arenaCount === 1 ? 'arena' : 'arenas'} available
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UsersIcon size={16} className="text-purple-400" />
                            <span>Players in queue</span>
                          </div>
                          <span className="font-bold text-white">{mode.players}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ClockIcon size={16} className="text-cyan-400" />
                            <span>Avg. wait time</span>
                          </div>
                          <span className="font-bold text-white">{mode.avgWait}</span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <Button
                        variant="neon"
                        className="w-full group-hover:scale-105 transition-transform"
                        onClick={() => handleJoinQueue(mode)}
                      >
                        <PlayIcon size={16} className="mr-2" />
                        Join Queue
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <Card className="glass mt-10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <GamepadIcon size={24} className="text-cyan-400" />
            How Queue Works
          </h3>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-start gap-3">
              <Badge className="bg-cyan-500 text-white flex-shrink-0">1</Badge>
              <p>Select a game mode and join the queue</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-cyan-500 text-white flex-shrink-0">2</Badge>
              <p>Wait for your turn while watching the estimated time</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-cyan-500 text-white flex-shrink-0">3</Badge>
              <p>When it's your turn, you'll get full control of the device</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-cyan-500 text-white flex-shrink-0">4</Badge>
              <p>Complete your game session and earn rewards!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
