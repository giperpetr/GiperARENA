'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  UsersIcon,
  SearchIcon,
  TrophyIcon,
  GamepadIcon,
  PlusIcon,
  LockIcon,
  UnlockIcon
} from '@/components/ui/icons';

const GROUPS = [
  {
    id: 1,
    name: 'Elite Warriors',
    emoji: '⚔️',
    members: 1248,
    description: 'Top-tier competitive players. Tournament focused.',
    isPrivate: true,
    level: 'Expert',
    activePlayers: 342
  },
  {
    id: 2,
    name: 'Speed Demons',
    emoji: '🏎️',
    members: 892,
    description: 'Racing enthusiasts and speedrun record chasers.',
    isPrivate: false,
    level: 'Advanced',
    activePlayers: 156
  },
  {
    id: 3,
    name: 'Casual Commanders',
    emoji: '🎮',
    members: 2105,
    description: 'Friendly community for casual play and learning.',
    isPrivate: false,
    level: 'Beginner',
    activePlayers: 523
  },
  {
    id: 4,
    name: 'Tech Innovators',
    emoji: '🤖',
    members: 645,
    description: 'Strategy discussion and meta analysis group.',
    isPrivate: false,
    level: 'Intermediate',
    activePlayers: 89
  },
  {
    id: 5,
    name: 'Night Owls',
    emoji: '🦉',
    members: 567,
    description: 'Late-night gaming squad. Active 10PM-6AM.',
    isPrivate: false,
    level: 'All Levels',
    activePlayers: 234
  },
  {
    id: 6,
    name: 'Prize Hunters',
    emoji: '💰',
    members: 1523,
    description: 'Tournament grinders. Prize pool focused.',
    isPrivate: true,
    level: 'Expert',
    activePlayers: 412
  }
];

export default function GroupsPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Advanced':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Expert':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient-cyan-purple mb-4">
            Community Groups
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join groups, find teammates, and connect with players who share your interests
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search groups..."
              className="pl-10 h-12 bg-white/5 border-white/10 focus:border-cyan-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon size={18} />
            </span>
          </div>

          {/* Create Group Button */}
          <Button variant="neon" size="lg" className="sm:w-auto">
            <PlusIcon size={18} className="mr-2" />
            Create Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{GROUPS.length}</div>
            <div className="text-sm text-muted-foreground">Active Groups</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {GROUPS.reduce((acc, g) => acc + g.members, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {GROUPS.reduce((acc, g) => acc + g.activePlayers, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </Card>
          <Card className="glass p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Always Active</div>
          </Card>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GROUPS.map((group) => (
            <Card
              key={group.id}
              className="glass-hover hover-lift cursor-pointer group"
            >
              <div className="p-6 space-y-4">
                {/* Group Icon & Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-xl flex items-center justify-center text-4xl">
                      {group.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                          {group.name}
                        </h3>
                        {group.isPrivate ? (
                          <LockIcon size={14} className="text-yellow-400" />
                        ) : (
                          <UnlockIcon size={14} className="text-green-400" />
                        )}
                      </div>
                      <Badge className={`${getLevelColor(group.level)} border text-xs`}>
                        {group.level}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <UsersIcon size={16} className="text-cyan-400" />
                    <div>
                      <div className="font-bold text-white">{group.members.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GamepadIcon size={16} className="text-green-400" />
                    <div>
                      <div className="font-bold text-white">{group.activePlayers}</div>
                      <div className="text-xs text-muted-foreground">Online</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant={group.isPrivate ? 'outline' : 'neon'}
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  {group.isPrivate ? 'Request to Join' : 'Join Group'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="glass mt-10 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrophyIcon size={28} className="text-yellow-400" />
            Group Benefits
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-cyan-500 text-white flex-shrink-0">1</Badge>
                <div>
                  <h4 className="font-bold text-white mb-1">Team Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Find teammates for tournaments and competitive play
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-cyan-500 text-white flex-shrink-0">2</Badge>
                <div>
                  <h4 className="font-bold text-white mb-1">Learn Together</h4>
                  <p className="text-sm text-muted-foreground">
                    Share strategies, tips, and improve your skills
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-500 text-white flex-shrink-0">3</Badge>
                <div>
                  <h4 className="font-bold text-white mb-1">Exclusive Events</h4>
                  <p className="text-sm text-muted-foreground">
                    Access group-only tournaments and prize pools
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-purple-500 text-white flex-shrink-0">4</Badge>
                <div>
                  <h4 className="font-bold text-white mb-1">Build Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with like-minded players worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
