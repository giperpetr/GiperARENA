'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarIcon, TrophyIcon, EyeIcon, PlayIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function CommunitySpotlight() {
  const achievements = [
    {
      playerName: 'DroneMaster',
      avatar: '🎮',
      achievement: 'Первая победа в Robot Arena',
      time: '5 минут назад',
      color: 'from-cyan-500/20 to-cyan-600/20',
    },
    {
      playerName: 'RoboKing',
      avatar: '🤖',
      achievement: 'Набрал 1000 побед',
      time: '15 минут назад',
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      playerName: 'PixelPilot',
      avatar: '🚁',
      achievement: 'Выиграл турнир Champion League',
      time: '1 час назад',
      color: 'from-pink-500/20 to-pink-600/20',
    },
  ];

  const topClips = [
    {
      id: 1,
      title: 'Эпичный камбэк в последнюю секунду',
      author: 'ProGamer',
      views: '12.5K',
      thumbnail: '🎬',
    },
    {
      id: 2,
      title: 'Идеальная игра без единой ошибки',
      author: 'PerfectPlayer',
      views: '8.2K',
      thumbnail: '🎥',
    },
    {
      id: 3,
      title: 'Новая тактика в Robot Battle',
      author: 'StrategyMaster',
      views: '15.7K',
      thumbnail: '📹',
    },
  ];

  const liveStreamers = [
    { name: 'StreamKing', emoji: '👑', viewers: 1247, game: 'Drone Racing' },
    { name: 'RoboQueen', emoji: '💎', viewers: 892, game: 'Robot Arena' },
    { name: 'TechWizard', emoji: '🧙', viewers: 654, game: 'Tank Battles' },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrophyIcon size={28} className="text-cyan-400" />
          Последние достижения
        </h2>
      </div>

      <div className="space-y-3">
        {achievements.map((item, index) => (
          <Card
            key={index}
            className={cn(
              'group relative overflow-hidden',
              'bg-white/5 backdrop-blur-lg border-white/10',
              'hover:bg-white/10 hover:border-white/20',
              'transition-all duration-300'
            )}
          >
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              item.color
            )} />

            <div className="relative p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                {item.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{item.playerName}</p>
                <p className="text-sm text-muted-foreground truncate">{item.achievement}</p>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
