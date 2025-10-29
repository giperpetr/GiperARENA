'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { QuickStatsBanner } from '@/components/home/QuickStatsBanner';
import { LiveGamesCarousel } from '@/components/home/LiveGamesCarousel';
import { FeaturedTournamentHero } from '@/components/home/FeaturedTournamentHero';
import { TrendingTournaments } from '@/components/home/TrendingTournaments';
import { TopPlayersLeaderboard } from '@/components/home/TopPlayersLeaderboard';
import { TopArenasShowcase } from '@/components/home/TopArenasShowcase';
import { CommunitySpotlight } from '@/components/home/CommunitySpotlight';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { NewsSection } from '@/components/home/NewsSection';
import { TokenPricesWidget } from '@/components/home/TokenPricesWidget';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { PartnerArenasShowcase } from '@/components/home/PartnerArenasShowcase';
import { FooterCTA } from '@/components/home/FooterCTA';
import { LiveStatsWidget } from '@/components/home/LiveStatsWidget';
import { AnimatedGradientLine } from '@/components/ui/animated-gradient-line';
import { GlowingDivider } from '@/components/ui/glowing-divider';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Stats Banner */}
      <QuickStatsBanner />

      {/* 3. Live Games Carousel */}
      <section className="relative px-6 py-16 lg:py-20 border-b border-border/20">
        <LiveGamesCarousel />
      </section>

      {/* 4. Featured Tournament Hero */}
      <FeaturedTournamentHero />

      {/* 5. Main Content Grid */}
      <section className="relative px-6 py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Left Column - Main Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-16 lg:space-y-20">
              {/* Trending Tournaments - топ-3 компактно */}
              <TrendingTournaments />

              <AnimatedGradientLine />

              {/* Top Arenas Showcase - топ-6 */}
              <TopArenasShowcase />

              <GlowingDivider />

              {/* Community Spotlight - только достижения */}
              <CommunitySpotlight />
            </div>

            {/* Right Column - Sidebar убран, контент перенесен */}
            {/* Top Players → /leaderboard */}
            {/* Upcoming Events → /tournaments */}
            {/* News → /news */}
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <HowItWorksSection />

      {/* 7. Partner Arenas Showcase */}
      <PartnerArenasShowcase />

      {/* 8. Footer CTA */}
      <FooterCTA />

      {/* Live Stats Widget - Fixed Position Overlay */}
      <LiveStatsWidget />
    </main>
  );
}
