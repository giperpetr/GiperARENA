# Детальная архитектура приложения ArenaHUB

## 1. Технологический стек

### Frontend (Web + Mobile)

**Framework:** Next.js 15+ с React 19+  
**Styling:** Tailwind CSS 4+ с custom dark theme  
**State Management:** Zustand + React Query  
**Blockchain:** Solana Web3.js + Wallet Adapter  
**Real-time:** Socket.io Client + WebRTC  
**UI Components:** Radix UI + Headless UI  
**Animation:** Framer Motion  
**Forms:** React Hook Form + Zod validation  
**Charts:** Recharts / Chart.js  
**Mobile:** React Native (shared codebase где возможно)

### Backend (Существующий стек + дополнения)

**Основа:** Ваш существующий Docker stack  
**API Gateway:** Node.js + Express/Fastify  
**Database:** PostgreSQL 17 (Supabase)  
**Real-time:** Supabase Realtime + Socket.io  
**Auth:** Supabase Auth + JWT  
**Storage:** MinIO S3  
**Cache:** Redis  
**Automation:** n8n  
**Monitoring:** Prometheus + Grafana + Loki + cAdvisor

**Дополнительные сервисы:**
- **WebRTC Media Server:** Janus Gateway / mediasoup
- **Blockchain Node:** Solana RPC Node (или Helius/QuickNode API)
- **Queue:** BullMQ (на Redis)
- **Search:** Elasticsearch (опционально)

### Arena Control Software (Raspberry Pi / Linux)

**OS:** Raspberry Pi OS / Ubuntu Server  
**Runtime:** Node.js + Python  
**Robot Control:** ROS 2 (Robot Operating System)  
**Video Streaming:** GStreamer + WebRTC  
**IoT Protocol:** MQTT  
**Monitoring:** Prometheus Node Exporter

---

## 2. Архитектура системы

### Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Web App     │  │  Mobile App  │  │  Admin Panel │     │
│  │  (Next.js)   │  │(React Native)│  │  (Next.js)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌─────────────────────────────┼────────────────────────────────┐
│                      API GATEWAY                             │
│                    (Node.js + Express)                       │
└─────────────────────────────┬────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  SUPABASE      │  │  BLOCKCHAIN     │  │  MEDIA SERVER   │
│  STACK         │  │  LAYER          │  │  (WebRTC)       │
│                │  │                 │  │                 │
│ - PostgreSQL   │  │ - Solana Node   │  │ - Janus/        │
│ - Auth         │  │ - Smart         │  │   mediasoup     │
│ - Realtime     │  │   Contracts     │  │ - RTMP/HLS      │
│ - Storage      │  │ - Wallet        │  │ - Recording     │
│ - REST API     │  │   Integration   │  │                 │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────┐
│                    AUTOMATION & MONITORING                   │
│  ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  n8n   │  │Prometheus│  │ Grafana  │  │   Loki   │     │
│  └────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────┐
│                    ARENA LAYER (Edge)                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Arena Control Software (Raspberry Pi / Linux)     │     │
│  │  - ROS 2 (Robot Control)                           │     │
│  │  - GStreamer (Video Streaming)                     │     │
│  │  - MQTT Client (Commands)                          │     │
│  │  - WebRTC (Low-latency streaming)                  │     │
│  └────────────────────────────────────────────────────┘     │
│                              │                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Cameras  │  │  Robots  │  │  Sensors │  │ Actuators│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. База данных (PostgreSQL 17 + Supabase)

### Схема таблиц

#### Users (Пользователи)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE,
    email TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('player', 'organizer', 'admin', 'viewer')) DEFAULT 'player',
    
    -- Stats
    total_games INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_earnings DECIMAL(20, 8) DEFAULT 0,
    rating INT DEFAULT 1000,
    rank TEXT DEFAULT 'Novice',
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    kyc_status TEXT CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    
    -- Settings
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_rating ON users(rating DESC);
```

#### Arenas (Арены)

```sql
CREATE TABLE arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    tagline TEXT,
    
    -- Type & Configuration
    arena_type TEXT CHECK (arena_type IN ('robot_race', 'drone_race', 'robot_battle', 'puzzle', 'arcade', 'custom')) NOT NULL,
    game_modes TEXT[] DEFAULT '{}',
    max_players INT DEFAULT 1,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'medium',
    
    -- Location
    country TEXT,
    city TEXT,
    timezone TEXT,
    
    -- Media
    thumbnail_url TEXT,
    banner_url TEXT,
    video_trailer_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    
    -- Technical
    stream_urls JSONB, -- {primary: url, secondary: url, cameras: [{id, url, name}]}
    control_endpoint TEXT,
    mqtt_topic TEXT,
    
    -- Pricing
    entry_fee_pac DECIMAL(20, 8) DEFAULT 0,
    prize_pool_percentage INT DEFAULT 80, -- % от entry_fee идёт в призовой фонд
    
    -- Stats
    total_games INT DEFAULT 0,
    total_players INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    reviews_count INT DEFAULT 0,
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'pending_verification', 'active', 'inactive', 'banned')) DEFAULT 'draft',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_stake_gac DECIMAL(20, 8) DEFAULT 0,
    
    -- Schedule
    operating_hours JSONB, -- {monday: {start: '09:00', end: '21:00'}, ...}
    is_online BOOLEAN DEFAULT FALSE,
    last_online_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_arenas_owner ON arenas(owner_id);
CREATE INDEX idx_arenas_type ON arenas(arena_type);
CREATE INDEX idx_arenas_status ON arenas(status);
CREATE INDEX idx_arenas_rating ON arenas(rating DESC);
CREATE INDEX idx_arenas_slug ON arenas(slug);
```

#### Game_Sessions (Игровые сессии)

```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
    
    -- Session Info
    session_type TEXT CHECK (session_type IN ('practice', 'ranked', 'tournament', 'custom')) DEFAULT 'ranked',
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    
    -- Configuration
    max_players INT DEFAULT 1,
    entry_fee_pac DECIMAL(20, 8) DEFAULT 0,
    prize_pool_pac DECIMAL(20, 8) DEFAULT 0,
    
    -- Status
    status TEXT CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'waiting',
    
    -- Timing
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INT,
    
    -- Results
    results JSONB, -- [{player_id, position, score, earnings}]
    replay_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_arena ON game_sessions(arena_id);
CREATE INDEX idx_sessions_status ON game_sessions(status);
CREATE INDEX idx_sessions_tournament ON game_sessions(tournament_id);
CREATE INDEX idx_sessions_start_time ON game_sessions(scheduled_start_time);
```

#### Session_Players (Участники сессий)

```sql
CREATE TABLE session_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ready_status BOOLEAN DEFAULT FALSE,
    
    -- Results
    position INT,
    score DECIMAL(10, 2),
    earnings_pac DECIMAL(20, 8) DEFAULT 0,
    
    -- Stats
    gameplay_stats JSONB, -- {checkpoints_passed, time_per_checkpoint, errors, etc}
    
    UNIQUE(session_id, player_id)
);

CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_session_players_player ON session_players(player_id);
```

#### Tournaments (Турниры)

```sql
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    
    -- Configuration
    format TEXT CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')) NOT NULL,
    max_participants INT NOT NULL,
    entry_fee_pac DECIMAL(20, 8) DEFAULT 0,
    
    -- Prize Pool
    prize_pool_pac DECIMAL(20, 8) DEFAULT 0,
    prize_distribution JSONB, -- {1: 50%, 2: 30%, 3: 20%}
    
    -- Schedule
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    tournament_start TIMESTAMP WITH TIME ZONE,
    tournament_end TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
    current_round INT DEFAULT 0,
    
    -- Bracket
    bracket JSONB, -- Tournament bracket structure
    
    -- Stats
    participants_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_arena ON tournaments(arena_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start ON tournaments(tournament_start);
```

#### Tournament_Participants (Участники турниров)

```sql
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seed INT, -- Seeding for bracket
    
    -- Results
    final_position INT,
    earnings_pac DECIMAL(20, 8) DEFAULT 0,
    
    -- Status
    is_eliminated BOOLEAN DEFAULT FALSE,
    eliminated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(tournament_id, player_id)
);

CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_player ON tournament_participants(player_id);
```

#### Betting_Markets (Рынки ставок)

```sql
CREATE TABLE betting_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- Market Info
    market_type TEXT CHECK (market_type IN ('winner', 'top3', 'over_under_time', 'custom')) NOT NULL,
    description TEXT,
    
    -- Outcomes
    outcomes JSONB NOT NULL, -- [{id, name, odds, total_staked}]
    
    -- Status
    status TEXT CHECK (status IN ('open', 'locked', 'settled', 'cancelled')) DEFAULT 'open',
    winning_outcome_id TEXT,
    
    -- Timing
    closes_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    total_volume_pac DECIMAL(20, 8) DEFAULT 0,
    total_bets INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_betting_markets_session ON betting_markets(session_id);
CREATE INDEX idx_betting_markets_tournament ON betting_markets(tournament_id);
CREATE INDEX idx_betting_markets_status ON betting_markets(status);
```

#### Bets (Ставки)

```sql
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES betting_markets(id) ON DELETE CASCADE,
    bettor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Bet Details
    outcome_id TEXT NOT NULL,
    stake_pac DECIMAL(20, 8) NOT NULL,
    odds DECIMAL(10, 4) NOT NULL,
    potential_payout_pac DECIMAL(20, 8) NOT NULL,
    
    -- Result
    status TEXT CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'refunded')) DEFAULT 'pending',
    actual_payout_pac DECIMAL(20, 8) DEFAULT 0,
    
    -- Timestamps
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bets_market ON bets(market_id);
CREATE INDEX idx_bets_bettor ON bets(bettor_id);
CREATE INDEX idx_bets_status ON bets(status);
```

#### NFTs (NFT токены)

```sql
CREATE TABLE nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Blockchain
    mint_address TEXT UNIQUE NOT NULL,
    token_standard TEXT DEFAULT 'metaplex',
    
    -- Ownership
    current_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Type
    nft_type TEXT CHECK (nft_type IN ('equipment', 'arena', 'achievement', 'cosmetic')) NOT NULL,
    
    -- Metadata
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    animation_url TEXT,
    attributes JSONB, -- [{trait_type, value}]
    
    -- Marketplace
    is_listed BOOLEAN DEFAULT FALSE,
    listing_price_pac DECIMAL(20, 8),
    royalty_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Stats
    total_trades INT DEFAULT 0,
    last_sale_price_pac DECIMAL(20, 8),
    
    -- Timestamps
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nfts_mint ON nfts(mint_address);
CREATE INDEX idx_nfts_owner ON nfts(current_owner_id);
CREATE INDEX idx_nfts_type ON nfts(nft_type);
CREATE INDEX idx_nfts_listed ON nfts(is_listed);
```

#### NFT_Listings (Листинги NFT)

```sql
CREATE TABLE nft_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nft_id UUID REFERENCES nfts(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Listing Details
    listing_type TEXT CHECK (listing_type IN ('fixed_price', 'auction')) NOT NULL,
    price_pac DECIMAL(20, 8),
    
    -- Auction specific
    starting_price_pac DECIMAL(20, 8),
    current_bid_pac DECIMAL(20, 8),
    highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    auction_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT CHECK (status IN ('active', 'sold', 'cancelled', 'expired')) DEFAULT 'active',
    
    -- Timestamps
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_nft_listings_nft ON nft_listings(nft_id);
CREATE INDEX idx_nft_listings_seller ON nft_listings(seller_id);
CREATE INDEX idx_nft_listings_status ON nft_listings(status);
```

#### Wallets (Кошельки)

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Balances
    balance_pac DECIMAL(20, 8) DEFAULT 0,
    balance_gac DECIMAL(20, 8) DEFAULT 0,
    
    -- Staking
    staked_gac DECIMAL(20, 8) DEFAULT 0,
    staking_tier TEXT CHECK (staking_tier IN ('none', 'bronze', 'silver', 'gold', 'platinum')) DEFAULT 'none',
    staking_rewards_pending DECIMAL(20, 8) DEFAULT 0,
    
    -- Stats
    total_deposited DECIMAL(20, 8) DEFAULT 0,
    total_withdrawn DECIMAL(20, 8) DEFAULT 0,
    total_earned DECIMAL(20, 8) DEFAULT 0,
    total_spent DECIMAL(20, 8) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);
```

#### Transactions (Транзакции)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parties
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Transaction Details
    transaction_type TEXT CHECK (transaction_type IN (
        'deposit', 'withdrawal', 'game_entry', 'game_prize', 
        'bet_stake', 'bet_payout', 'nft_purchase', 'nft_sale',
        'staking', 'unstaking', 'rewards', 'transfer', 'fee'
    )) NOT NULL,
    
    amount_pac DECIMAL(20, 8) DEFAULT 0,
    amount_gac DECIMAL(20, 8) DEFAULT 0,
    
    -- Reference
    reference_id UUID, -- ID сессии, ставки, NFT и т.д.
    reference_type TEXT,
    
    -- Blockchain
    blockchain_tx_hash TEXT,
    blockchain_status TEXT CHECK (blockchain_status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON transactions(from_user_id);
CREATE INDEX idx_transactions_to ON transactions(to_user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_blockchain ON transactions(blockchain_tx_hash);
```

#### Reviews (Отзывы)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Review
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT,
    
    -- Moderation
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(arena_id, reviewer_id)
);

CREATE INDEX idx_reviews_arena ON reviews(arena_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

#### Achievements (Достижения)

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Achievement Info
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    
    -- Type & Rarity
    achievement_type TEXT CHECK (achievement_type IN ('games_played', 'wins', 'tournaments', 'earnings', 'special')) NOT NULL,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    
    -- Requirements
    requirements JSONB, -- {games_played: 100, wins: 50, etc}
    
    -- Rewards
    reward_pac DECIMAL(20, 8) DEFAULT 0,
    reward_nft_template_id UUID,
    
    -- Stats
    total_unlocked INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
```

#### User_Achievements (Достижения пользователей)

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Progress
    progress JSONB, -- Current progress towards requirements
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Rewards
    rewards_claimed BOOLEAN DEFAULT FALSE,
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

#### Notifications (Уведомления)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type TEXT CHECK (notification_type IN (
        'game_starting', 'game_result', 'tournament_starting', 
        'bet_result', 'nft_sold', 'achievement_unlocked', 
        'message', 'system'
    )) NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT,
    
    -- Reference
    reference_id UUID,
    reference_type TEXT,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## 4. API Endpoints (REST + GraphQL)

### REST API Structure

**Base URL:** `https://api.arenahub.space/v1`

#### Authentication

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/wallet-connect
GET    /auth/me
PUT    /auth/me
```

#### Users

```
GET    /users/:id
GET    /users/:username
PUT    /users/:id
GET    /users/:id/stats
GET    /users/:id/games
GET    /users/:id/achievements
GET    /users/:id/nfts
GET    /users/leaderboard
```

#### Arenas

```
GET    /arenas
GET    /arenas/:id
POST   /arenas
PUT    /arenas/:id
DELETE /arenas/:id
GET    /arenas/:id/sessions
GET    /arenas/:id/reviews
POST   /arenas/:id/reviews
GET    /arenas/:id/stats
POST   /arenas/:id/verify
```

#### Game Sessions

```
GET    /sessions
GET    /sessions/:id
POST   /sessions
PUT    /sessions/:id
DELETE /sessions/:id
POST   /sessions/:id/join
POST   /sessions/:id/leave
POST   /sessions/:id/ready
POST   /sessions/:id/start
POST   /sessions/:id/end
GET    /sessions/:id/replay
```

#### Tournaments

```
GET    /tournaments
GET    /tournaments/:id
POST   /tournaments
PUT    /tournaments/:id
DELETE /tournaments/:id
POST   /tournaments/:id/register
POST   /tournaments/:id/unregister
GET    /tournaments/:id/bracket
POST   /tournaments/:id/advance-round
GET    /tournaments/:id/leaderboard
```

#### Betting

```
GET    /betting/markets
GET    /betting/markets/:id
POST   /betting/markets
PUT    /betting/markets/:id
POST   /betting/markets/:id/place-bet
GET    /betting/bets/:id
GET    /betting/my-bets
```

#### NFTs

```
GET    /nfts
GET    /nfts/:id
POST   /nfts/mint
PUT    /nfts/:id
GET    /nfts/:id/history
POST   /nfts/:id/list
POST   /nfts/:id/unlist
POST   /nfts/:id/buy
POST   /nfts/:id/bid
```

#### Wallets

```
GET    /wallet
GET    /wallet/balance
POST   /wallet/deposit
POST   /wallet/withdraw
GET    /wallet/transactions
POST   /wallet/stake
POST   /wallet/unstake
POST   /wallet/claim-rewards
```

#### Notifications

```
GET    /notifications
GET    /notifications/unread-count
PUT    /notifications/:id/read
PUT    /notifications/mark-all-read
DELETE /notifications/:id
```

---

(Продолжение следует в следующей части...)



## 5. Детальное описание страниц и компонентов

### 5.1. Landing Page (Главная страница)

**URL:** `/`

**Цель:** Привлечь новых пользователей, объяснить концепцию, побудить к регистрации

**Секции:**

1. **Hero Section**
   - Заголовок: "Control Real Robots. Win Real Money. From Anywhere."
   - Подзаголовок: Краткое описание концепции (2-3 предложения)
   - CTA кнопки: "Start Playing" (→ регистрация), "Watch Live" (→ /live)
   - Фоновое видео: Захватывающие моменты из игр
   - Статистика в реальном времени: Active Players, Live Arenas, Prize Pool Today

2. **How It Works Section**
   - 3-4 шага с иконками и анимациями:
     1. Choose Your Arena
     2. Control Real Devices
     3. Compete & Win
     4. Earn Crypto Rewards
   - Интерактивная демонстрация управления

3. **Featured Arenas Carousel**
   - Карточки топ-арен с:
     - Превью видео/GIF
     - Название и тип арены
     - Рейтинг (звёзды)
     - Текущий статус (Live / Offline / Queue: X players)
     - Entry fee
     - "Play Now" кнопка

4. **Live Games Section**
   - Сетка из 4-6 текущих игр
   - Каждая карточка:
     - Livestream preview
     - Arena name
     - Current players
     - Prize pool
     - "Watch" кнопка

5. **Tokenomics Section**
   - Объяснение GAC и PAC
   - Визуализация экономики
   - "Learn More" → /tokenomics

6. **Leaderboard Preview**
   - Топ-10 игроков недели
   - "View Full Leaderboard" → /leaderboard

7. **Testimonials / Success Stories**
   - Отзывы игроков и организаторов
   - Видео-интервью

8. **Call to Action Section**
   - "Ready to Start Your Journey?"
   - Кнопки: "Create Account", "Explore Arenas"

9. **Footer**
   - Ссылки на соцсети
   - Документация, FAQ, Support
   - Legal (Terms, Privacy)

**Компоненты:**
- `HeroSection.tsx`
- `HowItWorksSection.tsx`
- `ArenaCarousel.tsx`
- `LiveGamesGrid.tsx`
- `TokenomicsSection.tsx`
- `LeaderboardPreview.tsx`
- `TestimonialsSection.tsx`
- `CTASection.tsx`
- `Footer.tsx`

---

### 5.2. Arenas Page (Каталог арен)

**URL:** `/arenas`

**Цель:** Помочь пользователям найти и выбрать арену для игры

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo, Navigation, Wallet, Profile)            │
├──────────────┬──────────────────────────────────────────┤
│              │  Search Bar                              │
│              ├──────────────────────────────────────────┤
│  Filters     │  Sort: [Most Popular ▼]  View: [Grid]   │
│  Sidebar     ├──────────────────────────────────────────┤
│              │                                          │
│  - Type      │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  - Status    │  │Arena│  │Arena│  │Arena│  │Arena│   │
│  - Price     │  │ 1   │  │ 2   │  │ 3   │  │ 4   │   │
│  - Rating    │  └─────┘  └─────┘  └─────┘  └─────┘   │
│  - Location  │                                          │
│              │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│              │  │Arena│  │Arena│  │Arena│  │Arena│   │
│              │  │ 5   │  │ 6   │  │ 7   │  │ 8   │   │
│              │  └─────┘  └─────┘  └─────┘  └─────┘   │
│              │                                          │
│              │  [Load More] / Pagination                │
└──────────────┴──────────────────────────────────────────┘
```

**Filters (Sidebar):**

1. **Arena Type**
   - ☐ Robot Race
   - ☐ Drone Race
   - ☐ Robot Battle
   - ☐ Puzzle
   - ☐ Arcade
   - ☐ Custom

2. **Status**
   - ☐ Live Now
   - ☐ Online (Available)
   - ☐ Offline
   - ☐ Queue Available

3. **Entry Fee (PAC)**
   - Slider: 0 - 1000+
   - Checkbox: ☐ Free Practice

4. **Rating**
   - ☐ 5 stars
   - ☐ 4+ stars
   - ☐ 3+ stars

5. **Difficulty**
   - ☐ Easy
   - ☐ Medium
   - ☐ Hard
   - ☐ Expert

6. **Location**
   - Dropdown: All Countries / Specific countries

7. **Verified Only**
   - Toggle switch

**Arena Card (Grid View):**

```
┌─────────────────────────────┐
│  [Video/Image Thumbnail]    │
│  [LIVE badge if online]     │
├─────────────────────────────┤
│  Arena Name                 │
│  ⭐⭐⭐⭐⭐ 4.8 (234)        │
│  📍 Tokyo, Japan            │
│  🎮 Robot Race              │
│  💰 Entry: 10 PAC           │
│  👥 12 playing now          │
│  ─────────────────────      │
│  [Play Now] [Watch]         │
└─────────────────────────────┘
```

**Arena Card (List View):**

```
┌────────────────────────────────────────────────────────┐
│ [Thumb] Arena Name            ⭐4.8  📍Tokyo  🎮Race  │
│         Brief description...                           │
│         Entry: 10 PAC  |  12 playing  |  [Play] [Watch]│
└────────────────────────────────────────────────────────┘
```

**Sort Options:**
- Most Popular
- Highest Rated
- Newest
- Lowest Entry Fee
- Highest Entry Fee
- Most Active

**Компоненты:**
- `ArenasPage.tsx`
- `ArenaFilters.tsx`
- `ArenaCard.tsx`
- `ArenaList.tsx`
- `SearchBar.tsx`
- `SortDropdown.tsx`

---

### 5.3. Arena Detail Page (Страница арены)

**URL:** `/arenas/:slug`

**Цель:** Предоставить полную информацию об арене, позволить присоединиться к игре

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐  ┌──────────────────┐   │
│  │                           │  │  Quick Info      │   │
│  │  Main Video Stream        │  │  ─────────────   │   │
│  │  (Live or Trailer)        │  │  Status: 🟢 Live │   │
│  │                           │  │  Entry: 10 PAC   │   │
│  │  [Camera Angles]          │  │  Players: 2/4    │   │
│  │  [Cam1][Cam2][Cam3]       │  │  Queue: 3        │   │
│  │                           │  │                  │   │
│  └───────────────────────────┘  │  [Join Game]     │   │
│                                  │  [Join Queue]    │   │
│  Arena Name                      │  [Watch Only]    │   │
│  by @organizer_name              │                  │   │
│  ⭐⭐⭐⭐⭐ 4.8 (234 reviews)     │  Prize Pool:     │   │
│  📍 Tokyo, Japan                 │  80 PAC          │   │
│                                  └──────────────────┘   │
│  [Tabs: About | Schedule | Stats | Reviews | Rules]    │
│  ─────────────────────────────────────────────────────  │
│  [Tab Content]                                          │
│                                                         │
│  Recent Games:                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Game 1  │ │ Game 2  │ │ Game 3  │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
│  Leaderboard (This Arena):                             │
│  1. Player1 - 1250 pts                                 │
│  2. Player2 - 1180 pts                                 │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

**Tabs Content:**

1. **About Tab**
   - Description (Markdown support)
   - Arena type & game modes
   - Difficulty level
   - Equipment used (with images)
   - Gallery (photos/videos)
   - Operating hours
   - Location map

2. **Schedule Tab**
   - Calendar view
   - Upcoming sessions
   - Recurring schedule
   - "Book a Session" button

3. **Stats Tab**
   - Total games played
   - Total players
   - Average game duration
   - Win rate distribution
   - Record times/scores
   - Charts and graphs

4. **Reviews Tab**
   - Rating breakdown (5⭐: 150, 4⭐: 60, etc.)
   - Filter: Most Recent / Highest Rated / Lowest Rated
   - Review cards with:
     - User avatar & name
     - Rating
     - Date
     - Comment
     - Verified purchase badge
     - Helpful votes

5. **Rules Tab**
   - Game rules (Markdown)
   - Scoring system
   - Time limits
   - Penalties
   - Fair play policy

**Right Sidebar (Quick Info):**

- Real-time status indicator
- Entry fee
- Current players / Max players
- Queue length
- Prize pool (current session)
- Action buttons:
  - "Join Game" (if space available)
  - "Join Queue" (if full)
  - "Watch Only" (spectator mode)
  - "Practice Mode" (if available)
- Organizer info:
  - Avatar
  - Name
  - Verification badge
  - "Message" button

**Компоненты:**
- `ArenaDetailPage.tsx`
- `VideoPlayer.tsx` (с поддержкой WebRTC)
- `CameraSelector.tsx`
- `QuickInfoPanel.tsx`
- `ArenaTabsNav.tsx`
- `AboutTab.tsx`
- `ScheduleTab.tsx`
- `StatsTab.tsx`
- `ReviewsTab.tsx`
- `RulesTab.tsx`
- `RecentGames.tsx`
- `ArenaLeaderboard.tsx`

---

### 5.4. Game Session Page (Страница игровой сессии)

**URL:** `/play/:sessionId`

**Цель:** Интерфейс для игры в реальном времени

**Layout (Игрок):**

```
┌─────────────────────────────────────────────────────────┐
│  [Exit] Arena Name - Session #12345      [Settings]    │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────┐  ┌──────────────┐   │
│  │                               │  │  Players     │   │
│  │  Main Video Feed              │  │  ─────────   │   │
│  │  (Your Robot's View)          │  │  1. You 🎮   │   │
│  │                               │  │     HP: ███  │   │
│  │                               │  │  2. Player2  │   │
│  │  [Overlay: HUD, Timer, Score] │  │     HP: ██   │   │
│  │                               │  │  3. Player3  │   │
│  │                               │  │     HP: █    │   │
│  │                               │  │              │   │
│  └───────────────────────────────┘  │  Time: 2:34  │   │
│                                      │  Score: 450  │   │
│  ┌───────────────────────────────┐  │              │   │
│  │  Controls                     │  │  Prize Pool: │   │
│  │  ┌───┐                        │  │  120 PAC     │   │
│  │  │ ↑ │    [A] [B] [X] [Y]    │  │              │   │
│  │┌─┼───┼─┐                      │  │  Chat:       │   │
│  ││←│ ↓ │→│  [Special Actions]   │  │  [Messages]  │   │
│  │└─┴───┴─┘                      │  │  [Input]     │   │
│  │                               │  └──────────────┘   │
│  │  Latency: 45ms  FPS: 60       │                     │
│  └───────────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

**Элементы интерфейса:**

1. **Top Bar**
   - Exit button (с подтверждением)
   - Arena name + Session ID
   - Settings (audio, video quality, controls)

2. **Main Video Feed**
   - WebRTC stream с минимальной задержкой
   - HUD overlay:
     - Timer (countdown или elapsed)
     - Score
     - Health/Energy bar (если применимо)
     - Checkpoints/Objectives
     - Mini-map (если применимо)
   - Camera angle selector (если доступны)

3. **Controls Panel**
   - Virtual joystick (для мобильных)
   - Action buttons (зависит от типа игры)
   - Special abilities (если есть)
   - Latency indicator
   - FPS counter

4. **Right Sidebar**
   - Players list с real-time статусами
   - Timer
   - Current score/position
   - Prize pool
   - Chat (text + emojis)
   - Quick reactions (👍👎🔥😂)

5. **Bottom Notifications**
   - Toast notifications для событий:
     - "Checkpoint reached!"
     - "Player2 eliminated"
     - "30 seconds remaining"

**Layout (Зритель):**

```
┌─────────────────────────────────────────────────────────┐
│  [Back] Arena Name - Session #12345    [Share] [Bet]   │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────┐  ┌──────────────┐   │
│  │                               │  │  Leaderboard │   │
│  │  Main Stream                  │  │  ─────────   │   │
│  │  (Arena Overview)             │  │  1. Player1  │   │
│  │                               │  │     Score:450│   │
│  │  [Switch View]                │  │  2. Player2  │   │
│  │  [Overview][Player1][Player2] │  │     Score:320│   │
│  │                               │  │  3. Player3  │   │
│  │                               │  │     Score:180│   │
│  └───────────────────────────────┘  │              │   │
│                                      │  Viewers: 234│   │
│  ┌───────────────────────────────┐  │              │   │
│  │  Chat                         │  │  Betting:    │   │
│  │  User1: Go Player1!           │  │  Winner?     │   │
│  │  User2: 🔥🔥🔥                │  │  ☐ Player1   │   │
│  │  [Type message...]            │  │  ☐ Player2   │   │
│  └───────────────────────────────┘  │  ☐ Player3   │   │
│                                      │  [Place Bet] │   │
│  [Tip Streamer] [Share] [Report]    └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Компоненты:**
- `GameSessionPage.tsx`
- `GameVideoPlayer.tsx`
- `GameControls.tsx` (разные для разных типов игр)
- `GameHUD.tsx`
- `PlayersPanel.tsx`
- `GameChat.tsx`
- `SpectatorView.tsx`
- `BettingPanel.tsx`
- `ViewerCount.tsx`

---

### 5.5. Tournaments Page (Турниры)

**URL:** `/tournaments`

**Цель:** Показать все турниры, позволить регистрацию

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  Tournaments                                            │
│  ─────────────────────────────────────────────────────  │
│  [Tabs: Upcoming | Live | Completed | My Tournaments]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  Featured Tournament                        │       │
│  │  ┌─────────┐  Championship Series #5        │       │
│  │  │ Banner  │  Prize Pool: 10,000 PAC        │       │
│  │  │ Image   │  Entry: 50 PAC                 │       │
│  │  └─────────┘  Starts in: 2d 5h 23m          │       │
│  │               128/256 registered             │       │
│  │               [Register Now]                 │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  All Tournaments:                                       │
│  ┌─────────────────────────────────────────────┐       │
│  │ Tournament 1                                │       │
│  │ Prize: 5000 PAC | Entry: 25 PAC | 64/128    │       │
│  │ Starts: Tomorrow 18:00 UTC                  │       │
│  │ [View Details] [Register]                   │       │
│  └─────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────┐       │
│  │ Tournament 2                                │       │
│  │ ...                                         │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Tournament Card:**
- Banner image
- Name
- Format (Single/Double Elimination, Round Robin)
- Prize pool
- Entry fee
- Registered / Max participants
- Start time (with countdown)
- Arena (if specific)
- Status badge (Registration Open / Full / In Progress / Completed)
- Action buttons

**Компоненты:**
- `TournamentsPage.tsx`
- `TournamentCard.tsx`
- `FeaturedTournament.tsx`
- `TournamentFilters.tsx`

---

### 5.6. Tournament Detail Page

**URL:** `/tournaments/:id`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────┐  ┌──────────────┐   │
│  │  Tournament Banner            │  │  Quick Info  │   │
│  └───────────────────────────────┘  │  ─────────   │   │
│                                      │  Prize Pool: │   │
│  Championship Series #5              │  10,000 PAC  │   │
│  by @organizer                       │              │   │
│  📅 Dec 25, 2025 - 18:00 UTC        │  Entry Fee:  │   │
│  🏆 Single Elimination               │  50 PAC      │   │
│                                      │              │   │
│  [Tabs: Overview | Bracket | Participants | Rules]  │   │
│  ─────────────────────────────────────────────────  │   │
│  [Tab Content]                       │  Registered: │   │
│                                      │  128/256     │   │
│                                      │              │   │
│                                      │  Starts in:  │   │
│                                      │  2d 5h 23m   │   │
│                                      │              │   │
│                                      │  [Register]  │   │
│                                      │  or          │   │
│                                      │  [Withdraw]  │   │
│                                      └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Tabs:**

1. **Overview**
   - Description
   - Schedule
   - Prize distribution
   - Sponsors (if any)

2. **Bracket**
   - Interactive bracket visualization
   - Click on match to see details
   - Real-time updates during tournament

3. **Participants**
   - List/Grid of all participants
   - Search/Filter
   - Player stats

4. **Rules**
   - Tournament rules
   - Scoring system
   - Tiebreakers

**Компоненты:**
- `TournamentDetailPage.tsx`
- `TournamentBracket.tsx`
- `ParticipantsList.tsx`
- `PrizeDistribution.tsx`

---

### 5.7. Profile Page (Профиль пользователя)

**URL:** `/profile/:username`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐  @username                                  │
│  │ Avatar │  Display Name                               │
│  │        │  ⭐ Gold Rank | Rating: 1850                │
│  └────────┘  📍 Location | 🔗 Website                   │
│              Bio text...                                │
│              [Edit Profile] [Message] [Follow]          │
│  ─────────────────────────────────────────────────────  │
│  Stats:                                                 │
│  Games: 234 | Wins: 156 | Win Rate: 66.7%              │
│  Earnings: 12,450 PAC | Tournaments: 15 | Wins: 3       │
│  ─────────────────────────────────────────────────────  │
│  [Tabs: Activity | NFTs | Achievements | Stats]         │
│  ─────────────────────────────────────────────────────  │
│  [Tab Content]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tabs:**

1. **Activity**
   - Recent games
   - Tournament participations
   - NFT trades
   - Achievements unlocked

2. **NFTs**
   - Grid of owned NFTs
   - Filter by type
   - "For Sale" badge

3. **Achievements**
   - Unlocked achievements
   - Progress on locked achievements
   - Rarity badges

4. **Stats**
   - Detailed statistics
   - Charts (win rate over time, earnings, etc.)
   - Favorite arenas
   - Best performances

**Edit Profile (Modal/Page):**
- Avatar upload
- Display name
- Bio
- Location
- Website
- Social links
- Privacy settings
- Notification preferences

**Компоненты:**
- `ProfilePage.tsx`
- `ProfileHeader.tsx`
- `ProfileStats.tsx`
- `ActivityTab.tsx`
- `NFTsTab.tsx`
- `AchievementsTab.tsx`
- `StatsTab.tsx`
- `EditProfileModal.tsx`

---

### 5.8. Wallet Page (Кошелёк)

**URL:** `/wallet`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  My Wallet                                              │
│  ─────────────────────────────────────────────────────  │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  PAC Balance     │  │  GAC Balance     │            │
│  │  1,234.56 PAC    │  │  5,678.90 GAC    │            │
│  │  ≈ $123.45       │  │  ≈ $567.89       │            │
│  │  [Deposit]       │  │  [Deposit]       │            │
│  │  [Withdraw]      │  │  [Withdraw]      │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  Staking                                     │      │
│  │  Staked: 5,000 GAC (Silver Tier)             │      │
│  │  APY: 15% | Rewards: 125.5 GAC               │      │
│  │  Lock ends: Dec 31, 2025                     │      │
│  │  [Claim Rewards] [Stake More] [Unstake]      │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Recent Transactions:                                   │
│  ─────────────────────────────────────────────────────  │
│  [Filter: All | Deposits | Withdrawals | Games | Bets] │
│  ┌──────────────────────────────────────────────┐      │
│  │ Game Entry Fee    -10 PAC    Dec 19, 14:23   │      │
│  │ Game Prize        +45 PAC    Dec 19, 14:45   │      │
│  │ Bet Payout        +120 PAC   Dec 19, 13:12   │      │
│  │ ...                                           │      │
│  └──────────────────────────────────────────────┘      │
│  [Load More]                                            │
└─────────────────────────────────────────────────────────┘
```

**Deposit Modal:**
- QR code для депозита
- Wallet address (copy button)
- Network selection (Solana)
- Minimum deposit amount
- Expected confirmation time

**Withdraw Modal:**
- Destination address input
- Amount input (with max button)
- Fee display
- Confirmation

**Компоненты:**
- `WalletPage.tsx`
- `BalanceCard.tsx`
- `StakingPanel.tsx`
- `TransactionsList.tsx`
- `DepositModal.tsx`
- `WithdrawModal.tsx`

---

### 5.9. NFT Marketplace

**URL:** `/marketplace`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├──────────────┬──────────────────────────────────────────┤
│              │  NFT Marketplace                         │
│              ├──────────────────────────────────────────┤
│  Filters     │  Search: [____________] [🔍]             │
│  ─────────   │  Sort: [Recently Listed ▼]               │
│              ├──────────────────────────────────────────┤
│  - Type      │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  - Rarity    │  │ NFT │  │ NFT │  │ NFT │  │ NFT │   │
│  - Price     │  │  1  │  │  2  │  │  3  │  │  4  │   │
│  - Status    │  └─────┘  └─────┘  └─────┘  └─────┘   │
│              │                                          │
│              │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│              │  │ NFT │  │ NFT │  │ NFT │  │ NFT │   │
│              │  │  5  │  │  6  │  │  7  │  │  8  │   │
│              │  └─────┘  └─────┘  └─────┘  └─────┘   │
└──────────────┴──────────────────────────────────────────┘
```

**NFT Card:**
```
┌─────────────────────────────┐
│  [Image/Animation]          │
│  [Rarity Badge]             │
├─────────────────────────────┤
│  NFT Name                   │
│  Type: Equipment            │
│  Price: 500 PAC             │
│  Last Sale: 450 PAC         │
│  ─────────────────────      │
│  [Buy Now] [Place Bid]      │
└─────────────────────────────┘
```

**NFT Detail Page** (`/marketplace/:nftId`):
- Large image/animation
- Attributes (traits)
- Owner info
- Creator info (with royalty %)
- Price history chart
- Trade history
- "Buy Now" or "Place Bid" button
- "Make Offer" button

**Компоненты:**
- `MarketplacePage.tsx`
- `NFTCard.tsx`
- `NFTDetailPage.tsx`
- `NFTFilters.tsx`
- `BuyNFTModal.tsx`
- `PlaceBidModal.tsx`

---

### 5.10. Leaderboard Page

**URL:** `/leaderboard`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  Global Leaderboard                                     │
│  ─────────────────────────────────────────────────────  │
│  [Tabs: Players | Arenas | Organizers]                  │
│  [Period: All Time | This Month | This Week | Today]    │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  🥇 Top 3 Highlight:                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   🥇     │  │   🥈     │  │   🥉     │             │
│  │ Player1  │  │ Player2  │  │ Player3  │             │
│  │ 2,450pts │  │ 2,100pts │  │ 1,980pts │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │ #  | Player      | Rating | Games | Wins | Earnings│
│  ├────┼─────────────┼────────┼───────┼──────┼─────────┤
│  │ 4  | Player4     | 1,850  | 234   | 156  | 12,450  │
│  │ 5  | Player5     | 1,820  | 198   | 132  | 10,230  │
│  │ ...│ ...         | ...    | ...   | ...  | ...     │
│  └─────────────────────────────────────────────┘       │
│  [Load More]                                            │
└─────────────────────────────────────────────────────────┘
```

**Компоненты:**
- `LeaderboardPage.tsx`
- `TopThreeHighlight.tsx`
- `LeaderboardTable.tsx`

---

### 5.11. Live Streams Page

**URL:** `/live`

**Цель:** Показать все текущие live игры для зрителей

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  Live Now                                               │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ [Stream 1]  │  │ [Stream 2]  │  │ [Stream 3]  │    │
│  │ 👁 234      │  │ 👁 156      │  │ 👁 89       │    │
│  │ Arena Name  │  │ Arena Name  │  │ Arena Name  │    │
│  │ Robot Race  │  │ Drone Race  │  │ Battle      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ [Stream 4]  │  │ [Stream 5]  │  │ [Stream 6]  │    │
│  │ ...         │  │ ...         │  │ ...         │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Компоненты:**
- `LiveStreamsPage.tsx`
- `LiveStreamCard.tsx`

---

### 5.12. Admin Panel (Панель организатора)

**URL:** `/organizer/dashboard`

**Доступ:** Только для пользователей с ролью "organizer"

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├──────────────┬──────────────────────────────────────────┤
│  Sidebar     │  Organizer Dashboard                     │
│  ─────────   ├──────────────────────────────────────────┤
│              │  Overview Stats:                         │
│  Dashboard   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  My Arenas   │  │Games │ │Players│ │Revenue│ │Rating│   │
│  Sessions    │  │ 234  │ │ 1,234 │ │5,678 │ │ 4.8  │   │
│  Analytics   │  └──────┘ └──────┘ └──────┘ └──────┘   │
│  Earnings    │                                          │
│  Settings    │  Revenue Chart (Last 30 days):           │
│              │  [Line Chart]                            │
│              │                                          │
│              │  Recent Sessions:                        │
│              │  [Table]                                 │
└──────────────┴──────────────────────────────────────────┘
```

**Pages:**

1. **Dashboard** (`/organizer/dashboard`)
   - Overview stats
   - Revenue charts
   - Recent activity

2. **My Arenas** (`/organizer/arenas`)
   - List of owned arenas
   - Create new arena
   - Edit/Delete arenas

3. **Create/Edit Arena** (`/organizer/arenas/new` or `/organizer/arenas/:id/edit`)
   - Form with all arena details
   - Media upload
   - Technical configuration
   - Pricing setup

4. **Sessions Management** (`/organizer/sessions`)
   - Upcoming sessions
   - Past sessions
   - Schedule new sessions

5. **Analytics** (`/organizer/analytics`)
   - Detailed analytics
   - Player demographics
   - Revenue breakdown
   - Performance metrics

6. **Earnings** (`/organizer/earnings`)
   - Total earnings
   - Payout history
   - Withdraw funds

7. **Settings** (`/organizer/settings`)
   - Arena control software setup
   - API keys
   - Webhooks
   - Notifications

**Компоненты:**
- `OrganizerDashboard.tsx`
- `MyArenasPage.tsx`
- `ArenaForm.tsx`
- `SessionsManagement.tsx`
- `AnalyticsPage.tsx`
- `EarningsPage.tsx`
- `OrganizerSettings.tsx`

---

(Продолжение следует в следующей части...)



## 6. Real-time Communication Architecture

### 6.1. WebRTC для управления роботами

**Требования:**
- Задержка < 100ms
- Надёжная передача команд
- Поддержка multiple camera streams

**Архитектура:**

```
Player Device (Browser/Mobile)
    ↓ WebRTC Data Channel
Media Server (Janus/mediasoup)
    ↓ WebRTC
Arena Control Software (Raspberry Pi)
    ↓ Serial/GPIO/ROS
Robot/Device
```

**Протокол команд (JSON over WebRTC Data Channel):**

```json
{
  "type": "control",
  "timestamp": 1703001234567,
  "command": "move",
  "params": {
    "direction": "forward",
    "speed": 0.8,
    "duration": 100
  }
}
```

**Типы команд:**
- `move` - движение (forward, backward, left, right, stop)
- `rotate` - поворот (angle, speed)
- `action` - специальные действия (grab, release, jump, shoot)
- `camera` - управление камерой (pan, tilt, zoom)

---

### 6.2. Socket.io для real-time updates

**События (Client → Server):**

```javascript
// Join game session
socket.emit('join_session', { sessionId, userId, role: 'player' });

// Ready status
socket.emit('player_ready', { sessionId, userId });

// Chat message
socket.emit('chat_message', { sessionId, message });

// Reaction
socket.emit('reaction', { sessionId, emoji: '🔥' });
```

**События (Server → Client):**

```javascript
// Session status update
socket.on('session_status', (data) => {
  // { status: 'waiting' | 'starting' | 'in_progress' | 'completed' }
});

// Player joined/left
socket.on('player_update', (data) => {
  // { type: 'joined' | 'left', player: {...} }
});

// Game state update
socket.on('game_state', (data) => {
  // { players: [...], scores: {...}, timer: 123 }
});

// Chat message
socket.on('chat_message', (data) => {
  // { userId, username, message, timestamp }
});

// Betting odds update
socket.on('odds_update', (data) => {
  // { marketId, outcomes: [...] }
});
```

---

### 6.3. MQTT для Arena Control

**Topics структура:**

```
arenahub/
  arenas/
    {arena_id}/
      status          # online/offline
      control/
        {session_id}/
          commands    # control commands from players
          state       # robot state updates
      telemetry       # sensors data
      cameras/
        {camera_id}/
          stream      # video stream metadata
```

**Пример сообщения:**

```json
// Topic: arenahub/arenas/abc123/control/session456/commands
{
  "playerId": "user789",
  "timestamp": 1703001234567,
  "command": "move",
  "params": {
    "direction": "forward",
    "speed": 0.8
  }
}

// Topic: arenahub/arenas/abc123/control/session456/state
{
  "robotId": "robot1",
  "timestamp": 1703001234567,
  "position": { "x": 12.5, "y": 8.3, "z": 0 },
  "orientation": { "yaw": 45, "pitch": 0, "roll": 0 },
  "battery": 85,
  "sensors": {
    "distance_front": 50,
    "distance_back": 120
  }
}
```

---

## 7. Arena Control Software (Raspberry Pi)

### 7.1. Архитектура

```
┌─────────────────────────────────────────────────┐
│  Arena Control Software (Node.js + Python)     │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐           │
│  │ MQTT Client  │  │ WebRTC Server│           │
│  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                    │
│  ┌──────▼──────────────────▼───────┐           │
│  │  Session Manager                │           │
│  │  - Queue management             │           │
│  │  - Player authentication        │           │
│  │  - Command validation           │           │
│  └──────┬──────────────────────────┘           │
│         │                                       │
│  ┌──────▼──────────────────────────┐           │
│  │  Robot Controller (ROS 2)       │           │
│  │  - Command execution            │           │
│  │  - Safety checks                │           │
│  │  - State monitoring             │           │
│  └──────┬──────────────────────────┘           │
│         │                                       │
│  ┌──────▼──────────────────────────┐           │
│  │  Video Streaming (GStreamer)    │           │
│  │  - Multiple cameras             │           │
│  │  - WebRTC encoding              │           │
│  │  - Adaptive bitrate             │           │
│  └─────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
         │                  │
         ▼                  ▼
    [Robots]          [Cameras]
```

### 7.2. Основные модули

**1. Connection Manager**
```javascript
// connection-manager.js
class ConnectionManager {
  constructor() {
    this.mqttClient = mqtt.connect(MQTT_BROKER);
    this.webrtcServer = new WebRTCServer();
    this.apiClient = new ArenaHubAPIClient();
  }

  async initialize() {
    await this.authenticate();
    await this.registerArena();
    this.startHeartbeat();
  }

  async authenticate() {
    const token = await this.apiClient.authenticate(ARENA_ID, API_KEY);
    this.token = token;
  }

  startHeartbeat() {
    setInterval(() => {
      this.mqttClient.publish(`arenahub/arenas/${ARENA_ID}/status`, {
        status: 'online',
        timestamp: Date.now()
      });
    }, 30000); // Every 30 seconds
  }
}
```

**2. Session Manager**
```javascript
// session-manager.js
class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.queue = [];
  }

  async createSession(sessionData) {
    const session = new GameSession(sessionData);
    this.activeSessions.set(session.id, session);
    
    // Subscribe to control commands
    this.mqttClient.subscribe(
      `arenahub/arenas/${ARENA_ID}/control/${session.id}/commands`
    );
    
    return session;
  }

  handleCommand(sessionId, playerId, command) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Validate player is in session
    if (!session.hasPlayer(playerId)) return;

    // Validate command
    if (!this.validateCommand(command)) return;

    // Execute command
    this.robotController.executeCommand(command);

    // Broadcast state update
    this.broadcastState(sessionId);
  }

  validateCommand(command) {
    // Check command rate limiting
    // Check command validity
    // Check safety constraints
    return true;
  }
}
```

**3. Robot Controller (Python + ROS 2)**
```python
# robot_controller.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.publisher = self.create_publisher(Twist, '/cmd_vel', 10)
        self.current_command = None
        
    def execute_command(self, command):
        if command['type'] == 'move':
            self.move(command['params'])
        elif command['type'] == 'rotate':
            self.rotate(command['params'])
        elif command['type'] == 'stop':
            self.stop()
    
    def move(self, params):
        msg = Twist()
        direction = params['direction']
        speed = params['speed']
        
        if direction == 'forward':
            msg.linear.x = speed
        elif direction == 'backward':
            msg.linear.x = -speed
        elif direction == 'left':
            msg.linear.y = speed
        elif direction == 'right':
            msg.linear.y = -speed
            
        self.publisher.publish(msg)
    
    def stop(self):
        msg = Twist()
        self.publisher.publish(msg)
```

**4. Video Streaming**
```bash
# GStreamer pipeline for WebRTC streaming
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  video/x-raw,width=1280,height=720,framerate=30/1 ! \
  videoconvert ! \
  vp8enc deadline=1 ! \
  rtpvp8pay ! \
  webrtcbin name=sendonly
```

---

## 8. Безопасность

### 8.1. Аутентификация и авторизация

**JWT Token структура:**

```json
{
  "userId": "uuid",
  "username": "player1",
  "role": "player",
  "walletAddress": "0x...",
  "iat": 1703001234,
  "exp": 1703087634
}
```

**Уровни доступа:**
- `player` - может играть, делать ставки, покупать NFT
- `organizer` - может создавать арены, управлять сессиями
- `admin` - полный доступ к платформе
- `viewer` - только просмотр (без аккаунта)

### 8.2. Rate Limiting

**API Rate Limits:**
- Неавторизованные: 100 req/hour
- Авторизованные: 1000 req/hour
- Premium (staked GAC): 10000 req/hour

**Game Control Rate Limits:**
- Команды управления: 50 commands/second
- Chat messages: 5 messages/10 seconds

### 8.3. Защита от мошенничества

**Anti-cheat меры:**
1. Server-side validation всех команд
2. Проверка физической возможности действий
3. Анализ паттернов поведения (ML)
4. Видео-запись всех игр для review
5. Репутационная система

**Betting security:**
1. Максимальная ставка на игру
2. Cooldown между ставками
3. KYC для крупных ставок
4. Мониторинг подозрительной активности

---

## 9. Мониторинг и логирование

### 9.1. Prometheus Metrics

**Application Metrics:**
```
# Active users
arenahub_active_users{role="player"} 1234
arenahub_active_users{role="organizer"} 56

# Active sessions
arenahub_active_sessions{arena_type="robot_race"} 45

# API requests
arenahub_api_requests_total{method="GET",endpoint="/arenas",status="200"} 12345

# WebRTC connections
arenahub_webrtc_connections{arena_id="abc123"} 8

# Transaction volume
arenahub_transaction_volume_pac{type="game_entry"} 5678.90
```

**Arena Metrics:**
```
# Arena status
arenahub_arena_status{arena_id="abc123",status="online"} 1

# Robot battery
arenahub_robot_battery{arena_id="abc123",robot_id="robot1"} 85

# Stream quality
arenahub_stream_bitrate{arena_id="abc123",camera_id="cam1"} 2500
arenahub_stream_fps{arena_id="abc123",camera_id="cam1"} 30
arenahub_stream_latency_ms{arena_id="abc123"} 45
```

### 9.2. Grafana Dashboards

**Dashboard 1: Platform Overview**
- Total users (gauge)
- Active sessions (graph)
- Revenue (graph)
- API response times (heatmap)

**Dashboard 2: Arena Performance**
- Arena status map
- Stream quality metrics
- Robot telemetry
- Player satisfaction scores

**Dashboard 3: Financial**
- Transaction volume
- Token prices
- Staking stats
- Revenue by arena

### 9.3. Loki Logging

**Log структура:**

```json
{
  "timestamp": "2025-12-19T14:23:45.123Z",
  "level": "info",
  "service": "api-gateway",
  "traceId": "abc123",
  "userId": "user789",
  "message": "User joined session",
  "metadata": {
    "sessionId": "session456",
    "arenaId": "arena123"
  }
}
```

**Log levels:**
- `debug` - детальная отладочная информация
- `info` - обычные события
- `warn` - предупреждения
- `error` - ошибки
- `fatal` - критические ошибки

---

## 10. Deployment и DevOps

### 10.1. Docker Compose (Production)

```yaml
version: '3.8'

services:
  # Frontend
  web:
    image: arenahub/web:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.arenahub.space
      - NEXT_PUBLIC_WS_URL=wss://ws.arenahub.space
    depends_on:
      - api

  # API Gateway
  api:
    image: arenahub/api:latest
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/arenahub
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SOLANA_RPC_URL=${SOLANA_RPC_URL}
    depends_on:
      - postgres
      - redis

  # WebRTC Media Server
  media-server:
    image: arenahub/media-server:latest
    ports:
      - "8088:8088"
      - "10000-10200:10000-10200/udp"
    environment:
      - STUN_SERVER=stun:stun.l.google.com:19302

  # PostgreSQL (Supabase)
  postgres:
    image: supabase/postgres:15
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO (S3)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # n8n
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}

  # Loki
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki

volumes:
  postgres_data:
  redis_data:
  minio_data:
  n8n_data:
  prometheus_data:
  grafana_data:
  loki_data:
```

### 10.2. CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: arenahub/web:latest,arenahub/web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/arenahub
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

---

## 11. Масштабирование

### 11.1. Horizontal Scaling

**API Gateway:**
- Load balancer (Nginx/HAProxy)
- Multiple API instances
- Session affinity для WebSocket

**Media Server:**
- Multiple media server instances
- Geographic distribution
- Automatic failover

**Database:**
- Read replicas для read-heavy операций
- Connection pooling (PgBouncer)
- Sharding по arena_id для больших объёмов

### 11.2. Caching Strategy

**Redis Cache Layers:**

1. **Session Cache** (TTL: 1 hour)
   - Active game sessions
   - Player states
   - Real-time leaderboards

2. **API Cache** (TTL: varies)
   - Arena listings (5 min)
   - User profiles (10 min)
   - Static content (1 hour)

3. **Rate Limiting** (TTL: 1 hour)
   - API request counts
   - Command rate limits

**CDN:**
- Static assets (images, videos)
- Replays
- NFT media

---

## 12. Тестирование

### 12.1. Unit Tests

```javascript
// Example: session-manager.test.js
describe('SessionManager', () => {
  it('should create a new session', async () => {
    const manager = new SessionManager();
    const session = await manager.createSession({
      arenaId: 'arena123',
      maxPlayers: 4
    });
    expect(session.id).toBeDefined();
    expect(session.players).toHaveLength(0);
  });

  it('should validate commands', () => {
    const manager = new SessionManager();
    const validCommand = { type: 'move', params: { direction: 'forward' } };
    expect(manager.validateCommand(validCommand)).toBe(true);
  });
});
```

### 12.2. Integration Tests

```javascript
// Example: api.test.js
describe('Arenas API', () => {
  it('should return list of arenas', async () => {
    const response = await request(app).get('/api/v1/arenas');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should create a new arena', async () => {
    const response = await request(app)
      .post('/api/v1/arenas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Arena',
        type: 'robot_race'
      });
    expect(response.status).toBe(201);
  });
});
```

### 12.3. E2E Tests (Playwright)

```javascript
// Example: game-flow.spec.js
test('complete game flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to arena
  await page.goto('/arenas/test-arena');
  await page.click('button:has-text("Join Game")');

  // Wait for game to start
  await page.waitForSelector('.game-controls');

  // Send control command
  await page.click('button[data-action="move-forward"]');

  // Verify game state update
  await expect(page.locator('.score')).toContainText('10');
});
```

---

## 13. Документация для разработчиков

### 13.1. API Documentation (OpenAPI/Swagger)

**Автогенерация документации:**

```javascript
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ArenaHUB API',
      version: '1.0.0',
      description: 'API for ArenaHUB platform'
    },
    servers: [
      {
        url: 'https://api.arenahub.space/v1',
        description: 'Production'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
```

**Пример аннотации:**

```javascript
/**
 * @swagger
 * /arenas:
 *   get:
 *     summary: Get list of arenas
 *     tags: [Arenas]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by arena type
 *     responses:
 *       200:
 *         description: List of arenas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Arena'
 */
router.get('/arenas', getArenas);
```

### 13.2. SDK для организаторов

**JavaScript SDK:**

```javascript
// arenahub-sdk.js
class ArenaHubSDK {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.arenahub.space/v1';
  }

  async registerArena(arenaData) {
    return await this.request('POST', '/arenas', arenaData);
  }

  async startSession(sessionData) {
    return await this.request('POST', '/sessions', sessionData);
  }

  async endSession(sessionId, results) {
    return await this.request('POST', `/sessions/${sessionId}/end`, results);
  }

  async request(method, endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return await response.json();
  }
}

// Usage
const sdk = new ArenaHubSDK('your-api-key');
await sdk.registerArena({
  name: 'My Arena',
  type: 'robot_race'
});
```

---

## 14. Roadmap разработки

### Phase 1: MVP (3 месяца)

**Month 1:**
- [ ] Базовая архитектура backend
- [ ] Database schema
- [ ] Authentication система
- [ ] Базовый frontend (Landing, Arenas list, Arena detail)

**Month 2:**
- [ ] WebRTC интеграция
- [ ] Базовое управление роботами
- [ ] Game session flow
- [ ] Wallet интеграция (Solana)

**Month 3:**
- [ ] Betting система (базовая)
- [ ] NFT marketplace (базовый)
- [ ] Admin panel для организаторов
- [ ] Тестирование и баг-фиксы

### Phase 2: Beta Launch (2 месяца)

**Month 4:**
- [ ] Tournaments система
- [ ] Leaderboards
- [ ] Achievements
- [ ] Mobile app (React Native)

**Month 5:**
- [ ] Staking контракты
- [ ] Governance система
- [ ] Advanced analytics
- [ ] Beta тестирование с реальными пользователями

### Phase 3: Public Launch (1 месяц)

**Month 6:**
- [ ] Оптимизация производительности
- [ ] Security audit
- [ ] Marketing campaign
- [ ] Public launch

### Phase 4: Post-Launch (Ongoing)

- [ ] VR integration
- [ ] Cross-chain bridge
- [ ] DAO treasury
- [ ] Mobile SDK для организаторов
- [ ] AI-powered features

---

## 15. Требования к команде разработки

### Необходимые роли:

1. **Full-stack Developer (2-3 человека)**
   - Next.js, React, TypeScript
   - Node.js, PostgreSQL
   - WebRTC, Socket.io

2. **Blockchain Developer (1-2 человека)**
   - Solana, Rust
   - Smart contracts
   - Web3.js

3. **DevOps Engineer (1 человек)**
   - Docker, Kubernetes
   - CI/CD
   - Monitoring (Prometheus, Grafana)

4. **Robotics Engineer (1-2 человека)**
   - ROS 2
   - Python
   - Hardware integration

5. **UI/UX Designer (1 человек)**
   - Figma
   - User research
   - Prototyping

6. **QA Engineer (1 человек)**
   - Test automation
   - Manual testing
   - Performance testing

**Total: 7-10 человек**

---

## Заключение

Данная архитектура представляет собой полноценную техническую спецификацию для разработки платформы ArenaHUB. Документ покрывает все аспекты:

- ✅ Технологический стек (существующий + дополнения)
- ✅ Database schema (PostgreSQL)
- ✅ API endpoints (REST)
- ✅ Детальное описание всех страниц и компонентов
- ✅ Real-time communication (WebRTC, Socket.io, MQTT)
- ✅ Arena Control Software
- ✅ Безопасность и мониторинг
- ✅ Deployment и DevOps
- ✅ Тестирование
- ✅ Roadmap разработки

Этот документ можно использовать как **requirement document** для агентской модели разработки или для передачи команде разработчиков.

