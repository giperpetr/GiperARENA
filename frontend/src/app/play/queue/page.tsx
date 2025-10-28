'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClockIcon,
  UsersIcon,
  GamepadIcon,
  TrophyIcon,
  PlayIcon,
  XIcon
} from '@/components/ui/icons';

const MOCK_QUEUE_STATUS = {
  position: 3,
  totalInQueue: 15,
  estimatedWait: '2 min 30 sec',
  selectedGame: 'Robot Arena Battle'
};

const AVAILABLE_MODES = [
  { id: 1, name: 'Robot Arena Battle', emoji: '🤖', players: 12, avgWait: '2 min' },
  { id: 2, name: 'Drone Racing', emoji: '🚁', players: 8, avgWait: '1 min' },
  { id: 3, name: 'Tank Battle Royale', emoji: '🚜', players: 15, avgWait: '3 min' }
];

export default function QueuePage() {
  const [inQueue, setInQueue] = useState(false);
  const [selectedMode, setSelectedMode] = useState<typeof AVAILABLE_MODES[0] | null>(null);
  const [countdown, setCountdown] = useState(150); // 2 min 30 sec

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

  const handleJoinQueue = (mode: typeof AVAILABLE_MODES[0]) => {
    setSelectedMode(mode);
    setInQueue(true);
  };

  const handleLeaveQueue = () => {
    setInQueue(false);
    setSelectedMode(null);
    setCountdown(150);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AVAILABLE_MODES.map((mode) => (
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
