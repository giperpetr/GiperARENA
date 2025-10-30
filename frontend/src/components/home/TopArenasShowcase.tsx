'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Arena } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArenaIcon, StarIcon, UsersIcon } from '@/components/ui/icons';

export function TopArenasShowcase() {
  const [hoveredArena, setHoveredArena] = useState<string | null>(null);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Fetch top arenas from API
  const { data: arenas, isLoading, error } = useQuery({
    queryKey: ['arenas', 'top'],
    queryFn: async () => {
      const response = await api.getArenas({ limit: 6, sort: 'rating' });
      return response as Arena[];
    },
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  const formatPlayerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < fullStars || (i === fullStars && hasHalfStar);
          return (
            <StarIcon
              key={i}
              size={16}
              className={isFilled ? 'text-cyan-400 fill-cyan-400' : 'text-white/20 fill-white/20'}
            />
          );
        })}
        <span className="text-sm text-white/80 ml-1 font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const nextImage = (arenaId: string, imagesLength: number) => {
    setImageIndices(prev => ({
      ...prev,
      [arenaId]: ((prev[arenaId] || 0) + 1) % imagesLength
    }));
  };

  const prevImage = (arenaId: string, imagesLength: number) => {
    setImageIndices(prev => ({
      ...prev,
      [arenaId]: ((prev[arenaId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Top Arenas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white/5 backdrop-blur-lg border-white/10 overflow-hidden animate-pulse"
            >
              <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-10 bg-white/10 rounded w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Top Arenas</h2>
        <Card className="bg-red-900/20 backdrop-blur-lg border-red-500/30 p-6">
          <p className="text-red-300 text-center">
            Failed to load arenas. Please try again later.
          </p>
          <p className="text-red-400/60 text-sm text-center mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </Card>
      </div>
    );
  }

  // No data state
  if (!arenas || arenas.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Top Arenas</h2>
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
          <p className="text-white/60 text-center">No arenas available at the moment.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Top Arenas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arenas.map((arena) => {
          const currentImageIndex = imageIndices[arena.id] || 0;
          // Parse rating from string to number for display
          const rating = typeof arena.rating === 'string' ? parseFloat(arena.rating) : arena.rating;
          // Get images from media_urls or use fallback
          const images = arena.media_urls?.images || ['🎮'];
          const imageCount = images.length;

          return (
            <Card
              key={arena.id}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredArena(arena.id)}
              onMouseLeave={() => setHoveredArena(null)}
            >
              {/* Image Carousel */}
              <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 overflow-hidden">
                {images[currentImageIndex]?.startsWith('http') ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={arena.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {images[currentImageIndex]}
                  </div>
                )}

                {/* Image Navigation */}
                {hoveredArena === arena.id && imageCount > 1 && (
                  <>
                    <button
                      onClick={() => prevImage(arena.id, imageCount)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => nextImage(arena.id, imageCount)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      ▶
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {imageCount > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Verified Badge */}
                {arena.is_verified && (
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-0 text-xs">
                    ✓ Verified
                  </Badge>
                )}

                {/* Arena Type */}
                <Badge className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm text-white border-0 text-xs">
                  {arena.arena_type}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                  {arena.name}
                </h3>
                <p className="text-sm text-white/60 mb-3 flex items-center gap-1.5">
                  <ArenaIcon size={16} className="text-purple-400" />
                  {arena.location_address || 'Location not available'}
                </p>

                {/* Rating and Total Games */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div>{renderStars(rating)}</div>
                  <div className="flex items-center gap-1.5 text-sm text-white/80">
                    <UsersIcon size={16} className="text-cyan-400" />
                    <span className="font-semibold">{formatPlayerCount(arena.total_games || 0)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/arenas/${arena.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-semibold">
                      PLAY
                    </Button>
                  </Link>
                  <Button className="w-10 h-10 p-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xl">
                    +
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
