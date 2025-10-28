'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { LiveGamesCarousel } from '@/components/home/LiveGamesCarousel';
import { TrendingTournaments } from '@/components/home/TrendingTournaments';
import { TopPlayersLeaderboard } from '@/components/home/TopPlayersLeaderboard';
import { TopArenasShowcase } from '@/components/home/TopArenasShowcase';
import { NewsSection } from '@/components/home/NewsSection';
import { CommunityHighlights } from '@/components/home/CommunityHighlights';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { LiveStatsWidget } from '@/components/home/LiveStatsWidget';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Live Championship */}
      <HeroSection />

      {/* Live Games Carousel */}
      <section className="relative px-6 py-16 lg:py-20 border-b border-border/20">
        <LiveGamesCarousel />
      </section>

      {/* Main Content Grid */}
      <section className="relative px-6 py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left Column - Main Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-16 lg:space-y-20">
              {/* Trending Tournaments */}
              <TrendingTournaments />

              <Separator className="opacity-30" />

              {/* Top Arenas Showcase */}
              <TopArenasShowcase />

              <Separator className="opacity-30" />

              {/* Community Highlights */}
              <CommunityHighlights />
            </div>

            {/* Right Column - Sidebar (1/3 width) */}
            <div className="space-y-10 lg:space-y-12">
              {/* Top Players Leaderboard */}
              <TopPlayersLeaderboard />

              <Separator className="opacity-20" />

              {/* Upcoming Events */}
              <UpcomingEvents />

              <Separator className="opacity-20" />

              {/* News Section */}
              <NewsSection />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Widget - Fixed Position Overlay */}
      <LiveStatsWidget />
    </main>
  );
}
