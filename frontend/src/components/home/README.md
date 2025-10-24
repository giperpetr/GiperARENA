# Home Page Components

A comprehensive collection of 8 React components for the ArenaHUB home page, built with Next.js 15, TypeScript, and Tailwind CSS.

## Components Overview

### 1. LiveGamesCarousel
Horizontal scrolling carousel displaying 12 live game streams with navigation controls.

**Features:**
- Smooth horizontal scrolling with left/right arrow buttons
- Video thumbnail emojis with live badge
- Player name, avatar, viewer count, game type
- Stream duration display
- Glass morphism effects with hover animations
- Responsive design

**Usage:**
```tsx
import { LiveGamesCarousel } from '@/components/home';

<LiveGamesCarousel />
```

### 2. TrendingTournaments
List of top 5 tournaments with detailed information and action buttons.

**Features:**
- Rank badges with gradient colors (gold, silver, bronze)
- Tournament details: name, prize pool, player count, days left
- Status badges (active, registration, finished)
- Action buttons: REGISTER, VIEW BRACKET, WATCH
- Hover animations

**Usage:**
```tsx
import { TrendingTournaments } from '@/components/home';

<TrendingTournaments />
```

### 3. TopPlayersLeaderboard
Professional leaderboard table showing top 10 players.

**Features:**
- Table layout with columns: rank, player, tier, rating, wins, earnings
- Special rank styling (crown, silver, bronze for top 3)
- Tier badges with gradient colors (S+, S, A+, A, B+, B, C)
- Player avatars and country flags
- Hover effects on rows
- "View Full Leaderboard" link

**Usage:**
```tsx
import { TopPlayersLeaderboard } from '@/components/home';

<TopPlayersLeaderboard />
```

### 4. TopArenasShowcase
Grid of top 6 arenas with image carousels and action buttons.

**Features:**
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Image carousel with navigation arrows
- Star rating display
- Location and player count
- Verified badge for verified arenas
- Action buttons: PLAY, + (add to favorites)
- Hover animations

**Usage:**
```tsx
import { TopArenasShowcase } from '@/components/home';

<TopArenasShowcase />
```

### 5. NewsSection
List of 5 latest news items in card-based layout.

**Features:**
- News image, title, subtitle
- Category badges (announcement, update, tournament, arena)
- Time ago display
- View count and comment count
- Hover effects
- "View All News" link

**Usage:**
```tsx
import { NewsSection } from '@/components/home';

<NewsSection />
```

### 6. CommunityHighlights
Grid of 8 video highlights from the community.

**Features:**
- 4-column responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- Video thumbnail with category badge
- Duration display
- Play button overlay on hover
- Like count
- Player name
- Category-specific gradient badges (epic, funny, skill, fail)

**Usage:**
```tsx
import { CommunityHighlights } from '@/components/home';

<CommunityHighlights />
```

### 7. UpcomingEvents
List of 4 upcoming events with registration buttons.

**Features:**
- Time highlighting (TODAY with pulse animation, TOMORROW, future dates)
- Event type badges (championship, tournament, special)
- Arena, prize pool, players registered
- Action buttons: REGISTER, NOTIFY ME
- Hover animations

**Usage:**
```tsx
import { UpcomingEvents } from '@/components/home';

<UpcomingEvents />
```

### 8. LiveStatsWidget
Fixed position right sidebar widget with animated live statistics.

**Features:**
- Fixed position (top-right, hidden on screens < 1280px)
- Animated counters on mount
- Real-time simulation updates
- 5 stat categories: players online, games active, tournaments live, prize pool, viewers
- Progress bars with pulse animations
- Glass morphism effect
- Last updated timestamp

**Usage:**
```tsx
import { LiveStatsWidget } from '@/components/home';

<LiveStatsWidget />
```

## Complete Example Page

```tsx
// app/page.tsx or pages/index.tsx
'use client';

import {
  LiveGamesCarousel,
  TrendingTournaments,
  TopPlayersLeaderboard,
  TopArenasShowcase,
  NewsSection,
  CommunityHighlights,
  UpcomingEvents,
  LiveStatsWidget,
} from '@/components/home';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Live Stats Widget - Fixed Position */}
      <LiveStatsWidget />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Live Games Section */}
        <section>
          <LiveGamesCarousel />
        </section>

        {/* Two Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Tournaments */}
            <TrendingTournaments />

            {/* Top Arenas */}
            <TopArenasShowcase />

            {/* Community Highlights */}
            <CommunityHighlights />
          </div>

          <div className="space-y-8">
            {/* Top Players Leaderboard */}
            <TopPlayersLeaderboard />

            {/* Upcoming Events */}
            <UpcomingEvents />

            {/* Latest News */}
            <NewsSection />
          </div>
        </section>
      </div>
    </div>
  );
}
```

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with utility classes
- **UI Components:** Custom components from `@/components/ui`
- **Data:** Mock data from `@/lib/mock-data`
- **State Management:** React hooks (useState, useEffect)

## Design Features

All components include:
- Glass morphism effects (`backdrop-blur-lg`, `bg-white/5`)
- Smooth hover animations
- Responsive design (mobile-first approach)
- Tailwind utility classes
- Border styling with opacity (`border-white/10`)
- Gradient backgrounds
- Emoji-based icons/thumbnails
- Professional typography

## Responsive Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl, 2xl)

## Files Created

```
src/components/home/
├── LiveGamesCarousel.tsx
├── TrendingTournaments.tsx
├── TopPlayersLeaderboard.tsx
├── TopArenasShowcase.tsx
├── NewsSection.tsx
├── CommunityHighlights.tsx
├── UpcomingEvents.tsx
├── LiveStatsWidget.tsx
├── index.ts (barrel export)
└── README.md (this file)
```

## Testing

Basic test suite created in `__tests__/home-components.test.tsx` covering:
- Component rendering
- Data display from mock data
- Button and interaction elements
- Layout structure

Run tests:
```bash
npm test -- home-components.test.tsx
```

## Notes

- All components are client-side components (`'use client'`)
- Components use data from `@/lib/mock-data.ts`
- UI primitives from `@/components/ui` (button, card, badge)
- Fixed position widget (LiveStatsWidget) is hidden on screens < 1280px
- Animations include pulse effects, smooth transitions, hover states
