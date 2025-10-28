'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  GamepadIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  PlayIcon
} from '@/components/ui/icons';

// Mock data for games
const GAMES = [
  {
    id: 1,
    name: 'Robot Arena Battle',
    emoji: '🤖',
    type: 'Combat',
    players: 1248,
    activeSessions: 12,
    avgDuration: '8 min',
    difficulty: 'Medium',
    prizePool: '$5,000'
  },
  {
    id: 2,
    name: 'Drone Racing Championship',
    emoji: '🚁',
    type: 'Racing',
    players: 892,
    activeSessions: 8,
    avgDuration: '5 min',
    difficulty: 'Hard',
    prizePool: '$3,500'
  },
  {
    id: 3,
    name: 'Crawler Maze Challenge',
    emoji: '🕷️',
    type: 'Puzzle',
    players: 645,
    activeSessions: 5,
    avgDuration: '12 min',
    difficulty: 'Easy',
    prizePool: '$2,000'
  },
  {
    id: 4,
    name: 'Tank Battle Royale',
    emoji: '🚜',
    type: 'Combat',
    players: 1523,
    activeSessions: 15,
    avgDuration: '10 min',
    difficulty: 'Hard',
    prizePool: '$8,000'
  },
  {
    id: 5,
    name: 'Parkour Runner Pro',
    emoji: '🏃',
    type: 'Racing',
    players: 721,
    activeSessions: 6,
    avgDuration: '6 min',
    difficulty: 'Medium',
    prizePool: '$2,500'
  },
  {
    id: 6,
    name: 'Strategic Command',
    emoji: '⚔️',
    type: 'Strategy',
    players: 456,
    activeSessions: 3,
    avgDuration: '15 min',
    difficulty: 'Expert',
    prizePool: '$10,000'
  }
];

const GAME_TYPES = ['All', 'Combat', 'Racing', 'Puzzle', 'Strategy'];
const DIFFICULTY_LEVELS = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || game.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'All' || game.difficulty === selectedDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Hard':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Expert':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
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
            Game Modes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose from various game modes and compete with players worldwide for prizes and glory
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10 space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white/5 border-white/10 focus:border-cyan-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon size={18} />
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-4">
            {/* Game Type Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FilterIcon size={14} />
                <span>Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GAME_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={selectedType === type ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrophyIcon size={14} />
                <span>Difficulty:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_LEVELS.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={selectedDifficulty === difficulty ? 'bg-purple-500 hover:bg-purple-600' : ''}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="glass-hover hover-lift cursor-pointer group"
            >
              <div className="p-6 space-y-4">
                {/* Game Icon & Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-900/50 to-purple-900/50 rounded-xl flex items-center justify-center text-4xl">
                      {game.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">
                        {game.name}
                      </h3>
                      <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {game.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UsersIcon size={16} className="text-cyan-400" />
                    <span>{game.players} players</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PlayIcon size={16} className="text-purple-400" />
                    <span>{game.activeSessions} active</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockIcon size={16} className="text-blue-400" />
                    <span>{game.avgDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrophyIcon size={16} className="text-yellow-400" />
                    <span className="font-bold text-yellow-400">{game.prizePool}</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between pt-2">
                  <Badge className={`${getDifficultyColor(game.difficulty)} border`}>
                    {game.difficulty}
                  </Badge>
                  <Button
                    variant="neon"
                    size="sm"
                    className="group-hover:scale-105 transition-transform"
                  >
                    <PlayIcon size={14} className="mr-1" />
                    Play Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <GamepadIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
