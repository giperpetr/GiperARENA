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
    <div className="w-full space-y-8">
      <h2 className="text-2xl font-bold text-white">Community Spotlight</h2>

      {/* Recent Achievements */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90 mb-4">🏆 Последние достижения</h3>
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

      {/* Top Clips */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90 mb-4">🎬 Популярные клипы недели</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topClips.map((clip) => (
            <Card
              key={clip.id}
              className="group bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-purple-900/30 flex items-center justify-center text-5xl relative overflow-hidden">
                {clip.thumbnail}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayIcon size={48} className="text-white" />
                </div>
              </div>

              <div className="p-3">
                <h4 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-cyan-400 transition-colors">
                  {clip.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{clip.author}</span>
                  <div className="flex items-center gap-1">
                    <EyeIcon size={12} />
                    <span>{clip.views}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Live Streamers */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90 mb-4">📺 Сейчас стримят</h3>
        <div className="space-y-2">
          {liveStreamers.map((streamer, index) => (
            <Card
              key={index}
              className="group bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div className="p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xl">
                    {streamer.emoji}
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{streamer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{streamer.game}</p>
                </div>

                <div className="flex items-center gap-1 text-xs text-red-400">
                  <EyeIcon size={14} />
                  <span className="font-semibold">{streamer.viewers}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-white/20 hover:bg-white/10 font-semibold"
        >
          Смотреть все стримы
        </Button>
      </div>
    </div>
  );
}
