# ArenaHUB: Супер-промпт для Claude Code
## Полный контекст разработки интерактивной игровой платформы

---

## 🎯 МИССИЯ И ВИДЕНИЕ

**ArenaHUB** — это революционная платформа, которая объединяет физический и цифровой миры через удалённое управление реальными устройствами. Игроки со всего мира могут управлять роботами, дронами, краулер-машинами и другим оборудованием на физических аренах в реальном времени, участвовать в турнирах, делать ставки и зарабатывать криптовалюту.

### Ключевые метрики успеха (Year 1-3):
- **Q1 2026:** 5K активных пользователей, 5 пилотных арен, MVP готов
- **Q2 2026:** Запуск токенов GAC/PAC, $2M привлечено
- **Q3 2026:** 50K пользователей, 50 арен, публичный запуск
- **Q4 2026:** 100K пользователей, профитабельность, $21M годовой доход
- **2027:** 300K пользователей, 2000 арен, $21M доход
- **2028:** 1.5M пользователей, 4000 арен, $112M доход

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

### Слои приложения:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│  Web (Next.js) │ Mobile (React Native) │ VR/AR (WebXR)  │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    API GATEWAY LAYER                     │
│  REST API │ GraphQL │ WebSocket │ WebRTC Signaling      │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│  Auth │ Games │ Tournaments │ Betting │ Marketplace     │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                  DATA & INTEGRATION LAYER                │
│  Supabase │ PostgreSQL │ Redis │ Blockchain │ n8n       │
└─────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                   DEVICE CONTROL LAYER                   │
│  WebRTC │ IoT Protocol │ Device Drivers │ Sensors       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    PHYSICAL LAYER                        │
│  Robots │ Drones │ Cameras │ Sensors │ Hardware         │
└─────────────────────────────────────────────────────────┘
```

### Технологический стек:

| Компонент | Технология | Назначение |
|-----------|-----------|-----------|
| **Backend** | Supabase + PostgreSQL 17 | БД, Auth, Realtime, Storage |
| **Кэширование** | Redis | Sessions, Game State, Leaderboards |
| **Автоматизация** | n8n | Workflows, Email, Webhooks, Integrations |
| **Real-time** | WebRTC + Socket.io | Video/Audio Streaming, Device Control |
| **Blockchain** | Solana + Anchor | Smart Contracts, Tokens, NFT |
| **Frontend Web** | Next.js 14 + TypeScript | Web приложение |
| **Frontend Mobile** | React Native + TypeScript | iOS/Android приложение |
| **State Management** | Zustand | Global state |
| **UI Components** | shadcn/ui + Tailwind | Design system |
| **Мониторинг** | Sentry + Custom Logging | Error tracking, Metrics |

---

## 📋 ТРЕБОВАНИЯ ПО МОДУЛЯМ

### 1️⃣ МОДУЛЬ АУТЕНТИФИКАЦИИ И ПРОФИЛЕЙ

#### Функциональность:
- **Регистрация:** Email, Social (Google, Twitter, Discord), Web3 (Phantom, Solflare)
- **Двухфакторная аутентификация:** TOTP, SMS
- **KYC верификация:** Для участия в денежных играх (Sumsub интеграция)
- **Профили:** Аватар, статистика, достижения, балансы токенов
- **Роли:** Player, Arena Operator, Moderator, Admin
- **Рефералы:** Система с реферальными кодами и бонусами
- **Безопасность:** Восстановление пароля, смена email, удаление аккаунта

#### Database Schema:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  username VARCHAR UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_verified BOOLEAN,
  kyc_status ENUM('pending', 'approved', 'rejected'),
  reputation_score INTEGER DEFAULT 0
);

-- User roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  role ENUM('player', 'operator', 'moderator', 'admin'),
  created_at TIMESTAMP
);

-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  wallet_address VARCHAR,
  chain ENUM('solana'),
  is_primary BOOLEAN,
  created_at TIMESTAMP
);

-- User statistics
CREATE TABLE user_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  total_games_played INTEGER,
  total_earnings DECIMAL,
  total_spent DECIMAL,
  win_rate DECIMAL,
  current_rating INTEGER,
  updated_at TIMESTAMP
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID REFERENCES users,
  referred_id UUID REFERENCES users,
  bonus_amount DECIMAL,
  created_at TIMESTAMP
);
```

#### API Endpoints:
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/2fa/setup
POST   /api/auth/2fa/verify
POST   /api/auth/wallet/connect
POST   /api/auth/kyc/start
GET    /api/profile/:userId
PUT    /api/profile/:userId
GET    /api/profile/:userId/stats
GET    /api/profile/:userId/achievements
POST   /api/referral/generate-code
GET    /api/referral/stats
```

#### Smart Contracts:
```solidity
// Referral rewards contract
program ReferralProgram {
  - distribute_referral_bonus(referrer, amount)
  - claim_referral_rewards(user)
  - get_referral_stats(user)
}
```

---

### 2️⃣ МОДУЛЬ УПРАВЛЕНИЯ АРЕНАМИ

#### Функциональность:
- **Создание арен:** Организаторы создают арены с фото/видео
- **Типы арен:** Robot Racing, Claw Games, Drone Racing, Pet Games, Custom
- **Оборудование:** Регистрация как NFT, статус, история
- **Расписание:** Время работы, доступность
- **Ценообразование:** Цена игры, комиссии, подписки
- **Верификация:** Модерация администраторами
- **Аналитика:** Статистика, рейтинги, доход

#### Database Schema:
```sql
CREATE TABLE arenas (
  id UUID PRIMARY KEY,
  operator_id UUID REFERENCES users,
  name VARCHAR,
  description TEXT,
  arena_type ENUM('robot_racing', 'claw_games', 'drone_racing', 'pet_games', 'custom'),
  location POINT,
  country VARCHAR,
  city VARCHAR,
  cover_image_url TEXT,
  gallery_urls TEXT[],
  price_per_game DECIMAL,
  platform_commission_percent DECIMAL DEFAULT 10,
  is_verified BOOLEAN,
  verification_status ENUM('pending', 'approved', 'rejected'),
  rating DECIMAL,
  total_games INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE arena_devices (
  id UUID PRIMARY KEY,
  arena_id UUID REFERENCES arenas,
  nft_id VARCHAR, -- Solana NFT address
  device_name VARCHAR,
  device_type VARCHAR,
  status ENUM('online', 'offline', 'maintenance'),
  last_heartbeat TIMESTAMP,
  technical_specs JSONB,
  created_at TIMESTAMP
);

CREATE TABLE arena_schedule (
  id UUID PRIMARY KEY,
  arena_id UUID REFERENCES arenas,
  day_of_week INTEGER,
  open_time TIME,
  close_time TIME,
  is_active BOOLEAN
);

CREATE TABLE arena_stats (
  id UUID PRIMARY KEY,
  arena_id UUID REFERENCES arenas,
  total_revenue DECIMAL,
  total_games INTEGER,
  unique_players INTEGER,
  avg_rating DECIMAL,
  updated_at TIMESTAMP
);
```

#### API Endpoints:
```
POST   /api/arenas
GET    /api/arenas
GET    /api/arenas/:arenaId
PUT    /api/arenas/:arenaId
DELETE /api/arenas/:arenaId
POST   /api/arenas/:arenaId/devices
GET    /api/arenas/:arenaId/devices
PUT    /api/arenas/:arenaId/devices/:deviceId
GET    /api/arenas/:arenaId/stats
GET    /api/arenas/:arenaId/schedule
PUT    /api/arenas/:arenaId/schedule
POST   /api/arenas/:arenaId/verify (admin only)
GET    /api/arenas/search
GET    /api/arenas/trending
```

#### Smart Contracts:
```solidity
program ArenaNFT {
  - mint_device_nft(arena_id, device_name, specs)
  - transfer_device_nft(from, to, nft_id)
  - get_device_nft_metadata(nft_id)
}

program ArenaRevenue {
  - deposit_game_fee(arena_id, amount)
  - withdraw_operator_earnings(arena_id)
  - distribute_platform_commission()
}
```

---

### 3️⃣ МОДУЛЬ ИГРОВОГО ПРОЦЕССА И УПРАВЛЕНИЯ УСТРОЙСТВАМИ

#### Функциональность:
- **WebRTC соединение:** Видео стрим с камер, управление в реальном времени
- **Низкая задержка:** < 100ms для управления
- **Типы игр:** Time-based, Goal-based, Tournament, Practice, Betting
- **Управление:** Клавиатура, тачскрин, геймпад, VR контроллеры
- **Очереди:** Для популярных арен
- **Запись:** Game replays и highlights
- **VR/AR:** Иммерсивный опыт

#### Database Schema:
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  arena_id UUID REFERENCES arenas,
  player_id UUID REFERENCES users,
  device_id UUID REFERENCES arena_devices,
  game_type ENUM('time_based', 'goal_based', 'tournament', 'practice', 'betting'),
  status ENUM('waiting', 'active', 'completed', 'failed'),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  score INTEGER,
  result ENUM('win', 'loss', 'draw'),
  video_url TEXT,
  created_at TIMESTAMP
);

CREATE TABLE game_queue (
  id UUID PRIMARY KEY,
  arena_id UUID REFERENCES arenas,
  player_id UUID REFERENCES users,
  position INTEGER,
  wait_time_seconds INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE webrtc_sessions (
  id UUID PRIMARY KEY,
  game_session_id UUID REFERENCES game_sessions,
  player_id UUID REFERENCES users,
  device_id UUID REFERENCES arena_devices,
  connection_status ENUM('connecting', 'connected', 'disconnected'),
  latency_ms INTEGER,
  video_bitrate_kbps INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE game_commands (
  id UUID PRIMARY KEY,
  game_session_id UUID REFERENCES game_sessions,
  command_type VARCHAR,
  command_data JSONB,
  executed_at TIMESTAMP,
  device_response JSONB
);
```

#### API Endpoints:
```
POST   /api/games/start
GET    /api/games/:gameId
POST   /api/games/:gameId/command
POST   /api/games/:gameId/end
GET    /api/games/:gameId/replay
POST   /api/queue/join
DELETE /api/queue/:queueId
GET    /api/queue/status/:arenaId
GET    /api/games/history/:userId
POST   /api/games/:gameId/report
```

#### WebRTC Signaling:
```
WebSocket events:
- game:start -> Send SDP offer
- game:answer -> Receive SDP answer
- game:ice-candidate -> Exchange ICE candidates
- game:control-command -> Send device control
- game:device-response -> Receive device telemetry
- game:latency-check -> Ping/Pong for latency measurement
- game:end -> Close connection
```

#### Device Control Protocol:
```json
{
  "command_type": "move|rotate|action|calibrate",
  "parameters": {
    "direction": "forward|backward|left|right",
    "speed": 0-100,
    "angle": 0-360,
    "action_id": "grab|release|jump"
  },
  "timestamp": "ISO8601"
}
```

---

### 4️⃣ МОДУЛЬ ТОКЕНОМИКИ И БЛОКЧЕЙН ИНТЕГРАЦИИ

#### Токены:

**GAC (Government Arena Coin):**
- Фиксированный supply: 100,000,000 токенов
- Governance функции (голосование в DAO)
- Стейкинг для получения PAC наград
- Дефляционная модель с burn механизмом
- Распределение:
  - 25% Team & Advisors (4-year vesting)
  - 20% Investors (Seed round)
  - 15% Community Rewards
  - 15% Ecosystem Fund
  - 10% Liquidity
  - 10% Public Sale
  - 5% Treasury

**PAC (Play Arena Coin):**
- Эмиссионный механизм (контролируемая инфляция)
- Utility токен для оплаты игр
- Награды для игроков и операторов
- Начальный supply: 50,000,000 токенов
- Эмиссия: 5% годовых (снижается на 1% каждый год)
- Burn механизм: 10% от каждой транзакции сжигается

#### Стейкинг (GAC):

| Тир | GAC требуется | Lock период | APY в PAC | Бонусы |
|-----|---------------|-------------|-----------|--------|
| Bronze | 1,000 | 30 дней | 10% | -5% комиссия |
| Silver | 10,000 | 90 дней | 15% | -10% комиссия, приоритет в турнирах |
| Gold | 50,000 | 180 дней | 20% | -15% комиссия, VIP поддержка |
| Platinum | 100,000 | 365 дней | 30% | -20% комиссия, эксклюзивные турниры |

#### Smart Contracts на Solana:

**1. Token Contract:**
```rust
program GAC {
  - initialize_token(supply: u64)
  - mint(to: Pubkey, amount: u64)
  - burn(from: Pubkey, amount: u64)
  - transfer(from, to, amount)
}

program PAC {
  - initialize_token(supply: u64)
  - mint(to: Pubkey, amount: u64)
  - burn(from: Pubkey, amount: u64)
  - transfer(from, to, amount)
  - emit_inflation(amount: u64) // ежемесячная эмиссия
}
```

**2. Escrow Contract:**
```rust
program GameEscrow {
  - deposit_game_fee(player: Pubkey, arena: Pubkey, amount: u64)
  - release_to_winner(game_id: Pubkey, winner: Pubkey, amount: u64)
  - release_to_operator(arena: Pubkey, amount: u64)
  - refund_on_failure(player: Pubkey, amount: u64)
  - distribute_platform_commission(amount: u64)
}
```

**3. Staking Contract:**
```rust
program StakingPool {
  - stake(user: Pubkey, amount: u64, lock_period: u64)
  - unstake(user: Pubkey, stake_id: Pubkey)
  - claim_rewards(user: Pubkey, stake_id: Pubkey) -> u64
  - calculate_apy(tier: Tier) -> f64
  - distribute_daily_rewards()
}
```

**4. NFT Contract:**
```rust
program ArenaNFT {
  - mint_device_nft(arena: Pubkey, name: String, specs: Metadata)
  - mint_achievement_nft(player: Pubkey, achievement: String)
  - transfer_nft(from, to, nft_id)
  - get_nft_metadata(nft_id) -> Metadata
  - list_nft_for_sale(owner, nft_id, price)
  - buy_nft(buyer, nft_id, price)
}
```

**5. DAO Governance Contract:**
```rust
program DAOGovernance {
  - create_proposal(proposer: Pubkey, title: String, description: String, actions: Vec<Action>)
  - vote(voter: Pubkey, proposal_id: Pubkey, vote: bool, weight: u64)
  - execute_proposal(proposal_id: Pubkey)
  - get_proposal_status(proposal_id) -> Status
  - get_voting_power(user: Pubkey) -> u64 // based on GAC stake
}
```

**6. Betting Contract:**
```rust
program Betting {
  - create_bet(bettor: Pubkey, game_id: Pubkey, amount: u64, prediction: Outcome)
  - settle_bet(game_id: Pubkey, actual_outcome: Outcome)
  - claim_winnings(bettor: Pubkey, bet_id: Pubkey)
  - calculate_odds(total_bets: u64, bets_on_outcome: u64) -> f64
}
```

#### Database Schema (Blockchain):
```sql
CREATE TABLE blockchain_transactions (
  id UUID PRIMARY KEY,
  tx_hash VARCHAR UNIQUE,
  user_id UUID REFERENCES users,
  tx_type ENUM('stake', 'unstake', 'claim_rewards', 'game_payment', 'nft_mint', 'nft_transfer'),
  amount DECIMAL,
  token ENUM('GAC', 'PAC'),
  status ENUM('pending', 'confirmed', 'failed'),
  created_at TIMESTAMP,
  confirmed_at TIMESTAMP
);

CREATE TABLE staking_positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  amount DECIMAL,
  tier ENUM('bronze', 'silver', 'gold', 'platinum'),
  lock_until TIMESTAMP,
  rewards_earned DECIMAL,
  created_at TIMESTAMP
);

CREATE TABLE nft_inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  nft_address VARCHAR,
  nft_type ENUM('device', 'achievement', 'land'),
  metadata JSONB,
  created_at TIMESTAMP
);
```

#### Wallet Integration:
```typescript
// Supported wallets
- Phantom
- Solflare
- Ledger
- Magic Eden

// Operations
- Connect wallet
- Sign transaction
- Send tokens
- Receive tokens
- View balance
- Transaction history
```

---

### 5️⃣ МОДУЛЬ ТУРНИРОВ И СОРЕВНОВАНИЙ

#### Функциональность:
- **Форматы:** Single Elimination, Double Elimination, Round Robin, Swiss
- **Регистрация:** Entry fee в PAC, минимальный уровень аккаунта
- **Сетка:** Автоматическое формирование с учётом сидов
- **Трансляции:** Live-стриминг на Twitch/YouTube
- **Призовой фонд:** Автоматическое распределение через смарт-контракты
- **Типы:** Daily, Weekly, Seasonal, Special Events, Sponsored

#### Database Schema:
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  tournament_type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss'),
  status ENUM('registration', 'active', 'completed'),
  arena_id UUID REFERENCES arenas,
  entry_fee DECIMAL,
  max_participants INTEGER,
  current_participants INTEGER,
  prize_pool DECIMAL,
  platform_commission_percent DECIMAL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by UUID REFERENCES users,
  created_at TIMESTAMP
);

CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments,
  player_id UUID REFERENCES users,
  seed INTEGER,
  rating_at_join INTEGER,
  status ENUM('registered', 'active', 'eliminated', 'winner'),
  joined_at TIMESTAMP
);

CREATE TABLE tournament_matches (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments,
  player1_id UUID REFERENCES users,
  player2_id UUID REFERENCES users,
  game_session_id UUID REFERENCES game_sessions,
  round INTEGER,
  match_number INTEGER,
  winner_id UUID REFERENCES users,
  status ENUM('scheduled', 'active', 'completed'),
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE tournament_prizes (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments,
  place INTEGER,
  amount DECIMAL,
  distributed_to UUID REFERENCES users,
  distributed_at TIMESTAMP
);
```

#### API Endpoints:
```
POST   /api/tournaments
GET    /api/tournaments
GET    /api/tournaments/:tournamentId
PUT    /api/tournaments/:tournamentId
POST   /api/tournaments/:tournamentId/register
DELETE /api/tournaments/:tournamentId/unregister
GET    /api/tournaments/:tournamentId/bracket
GET    /api/tournaments/:tournamentId/matches
POST   /api/tournaments/:tournamentId/start-match
GET    /api/tournaments/:tournamentId/leaderboard
GET    /api/tournaments/trending
```

#### Smart Contracts:
```rust
program TournamentManagement {
  - create_tournament(name, prize_pool, entry_fee)
  - register_participant(tournament_id, player)
  - distribute_prizes(tournament_id, results)
  - refund_entry_fees(tournament_id)
}
```

---

### 6️⃣ МОДУЛЬ СТАВОК И BETTING

#### Функциональность:
- **Типы ставок:** Match Winner, Over/Under, Handicap, Prop Bets, Parlay
- **Odds:** Автоматический расчёт, динамическое изменение в live
- **Responsible Gambling:** Лимиты, self-exclusion, cooling-off
- **Compliance:** KYC, geo-blocking, налоговая отчётность
- **Безопасность:** Защита от match-fixing, мониторинг паттернов

#### Database Schema:
```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY,
  bettor_id UUID REFERENCES users,
  game_id UUID REFERENCES game_sessions,
  bet_type ENUM('match_winner', 'over_under', 'handicap', 'prop', 'parlay'),
  amount DECIMAL,
  prediction VARCHAR,
  odds DECIMAL,
  potential_winnings DECIMAL,
  status ENUM('pending', 'won', 'lost', 'void'),
  created_at TIMESTAMP,
  settled_at TIMESTAMP
);

CREATE TABLE betting_limits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  daily_limit DECIMAL,
  weekly_limit DECIMAL,
  monthly_limit DECIMAL,
  current_daily_spent DECIMAL,
  current_weekly_spent DECIMAL,
  current_monthly_spent DECIMAL,
  updated_at TIMESTAMP
);

CREATE TABLE responsible_gambling (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  self_excluded BOOLEAN,
  exclusion_until TIMESTAMP,
  cooling_off_until TIMESTAMP,
  loss_limit DECIMAL,
  updated_at TIMESTAMP
);
```

#### API Endpoints:
```
POST   /api/bets
GET    /api/bets/:betId
GET    /api/bets/user/:userId
POST   /api/bets/:betId/settle
GET    /api/odds/:gameId
GET    /api/betting-limits/:userId
PUT    /api/betting-limits/:userId
POST   /api/responsible-gambling/self-exclude
```

---

### 7️⃣ МОДУЛЬ СОЦИАЛЬНЫХ ФУНКЦИЙ И COMMUNITY

#### Функциональность:
- **Профили:** Кастомизация, статистика, коллекция NFT
- **Социальные взаимодействия:** Друзья, подписки, чаты, форумы
- **Достижения:** Автоматическое получение, NFT бейджи, награды в PAC
- **Лидерборды:** Глобальные, по аренам, сезонные, региональные
- **Контент:** Скриншоты, видео, highlights, шаринг в соцсетях
- **Community Events:** Челленджи, голосования, AMA, турниры

#### Database Schema:
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES users,
  user2_id UUID REFERENCES users,
  status ENUM('pending', 'accepted', 'blocked'),
  created_at TIMESTAMP
);

CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users,
  following_id UUID REFERENCES users,
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users,
  recipient_id UUID REFERENCES users,
  content TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE group_chats (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  arena_id UUID REFERENCES arenas,
  created_by UUID REFERENCES users,
  created_at TIMESTAMP
);

CREATE TABLE chat_members (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES group_chats,
  user_id UUID REFERENCES users,
  joined_at TIMESTAMP
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  icon_url TEXT,
  nft_id VARCHAR,
  reward_amount DECIMAL,
  created_at TIMESTAMP
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  achievement_id UUID REFERENCES achievements,
  unlocked_at TIMESTAMP
);

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  leaderboard_type ENUM('global', 'arena', 'seasonal', 'regional'),
  rank INTEGER,
  score INTEGER,
  updated_at TIMESTAMP
);

CREATE TABLE user_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  game_session_id UUID REFERENCES game_sessions,
  content_type ENUM('screenshot', 'video', 'highlight'),
  content_url TEXT,
  description TEXT,
  likes INTEGER,
  shares INTEGER,
  created_at TIMESTAMP
);
```

#### API Endpoints:
```
POST   /api/friends/add
DELETE /api/friends/:friendId
GET    /api/friends/:userId
POST   /api/follow/:userId
DELETE /api/follow/:userId
GET    /api/followers/:userId
GET    /api/following/:userId
POST   /api/messages
GET    /api/messages/:conversationId
POST   /api/group-chats
GET    /api/group-chats/:chatId
POST   /api/group-chats/:chatId/members
GET    /api/achievements
GET    /api/achievements/:userId
GET    /api/leaderboards/:type
POST   /api/content
GET    /api/content/:userId
POST   /api/content/:contentId/like
```

---

## 🗄️ DATABASE SCHEMA (ПОЛНАЯ СТРУКТУРА)

### Основные таблицы:

```sql
-- Users & Auth
users
user_roles
user_stats
wallets
referrals

-- Arenas
arenas
arena_devices
arena_schedule
arena_stats

-- Games
game_sessions
game_queue
webrtc_sessions
game_commands

-- Blockchain
blockchain_transactions
staking_positions
nft_inventory

-- Tournaments
tournaments
tournament_participants
tournament_matches
tournament_prizes

-- Betting
bets
betting_limits
responsible_gambling

-- Social
friendships
follows
messages
group_chats
chat_members
achievements
user_achievements
leaderboards
user_content

-- Moderation
reports
bans
suspensions
```

### Индексы для производительности:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Arenas
CREATE INDEX idx_arenas_operator_id ON arenas(operator_id);
CREATE INDEX idx_arenas_location ON arenas USING GIST(location);
CREATE INDEX idx_arena_devices_arena_id ON arena_devices(arena_id);

-- Games
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_arena_id ON game_sessions(arena_id);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at);

-- Blockchain
CREATE INDEX idx_blockchain_tx_user_id ON blockchain_transactions(user_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX idx_staking_user_id ON staking_positions(user_id);

-- Tournaments
CREATE INDEX idx_tournaments_arena_id ON tournaments(arena_id);
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);

-- Betting
CREATE INDEX idx_bets_bettor_id ON bets(bettor_id);
CREATE INDEX idx_bets_game_id ON bets(game_id);

-- Social
CREATE INDEX idx_friendships_user_id ON friendships(user1_id, user2_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
```

---

## 🔐 БЕЗОПАСНОСТЬ И COMPLIANCE

### Аутентификация и авторизация:
- JWT токены с 15-минутным expiry
- Refresh токены с 30-дневным expiry
- Row Level Security (RLS) в PostgreSQL
- Role-based access control (RBAC)
- Multi-signature для критических операций

### Защита данных:
- Шифрование чувствительных данных (AES-256)
- HTTPS для всех коммуникаций
- CORS политика для API
- Rate limiting (10 req/sec per IP)
- DDoS protection

### Compliance:
- GDPR: Экспорт данных, удаление, согласие
- KYC/AML: Верификация личности для денежных операций
- Лицензирование: Соответствие локальным регуляциям
- Налоги: Отчётность о выигрышах
- Ответственный гейминг: Лимиты, self-exclusion

### Мониторинг:
- Sentry для error tracking
- Custom logging в Supabase
- Метрики производительности
- Мониторинг аномальной активности
- Alert система для критических событий

---

## 📊 АНАЛИТИКА И МЕТРИКИ

### Ключевые метрики:
- **DAU (Daily Active Users):** Уникальные пользователи в день
- **MAU (Monthly Active Users):** Уникальные пользователи в месяц
- **ARPU (Average Revenue Per User):** Средний доход на пользователя
- **LTV (Lifetime Value):** Средняя стоимость пользователя
- **CAC (Customer Acquisition Cost):** Стоимость привлечения пользователя
- **Churn Rate:** Процент ушедших пользователей
- **Conversion Rate:** % регистрирующихся → играющих
- **Average Session Duration:** Средняя длительность игровой сессии
- **Games Per User:** Среднее количество игр на пользователя

### Dashboard:
```
Real-time metrics:
- Online users
- Active games
- Revenue (last 24h)
- New registrations
- Top arenas
- Top players
- System health
```

---

## 🚀 DEVELOPMENT ROADMAP

### Phase 1: Foundation (Weeks 1-4)
- [ ] Project setup & infrastructure
- [ ] Database schema & migrations
- [ ] Authentication system
- [ ] Basic user profiles
- [ ] CI/CD pipeline

### Phase 2: Core Features (Weeks 5-12)
- [ ] Arena management system
- [ ] Game session management
- [ ] WebRTC integration
- [ ] Basic blockchain integration (token contracts)
- [ ] Payment system (escrow)

### Phase 3: Advanced Features (Weeks 13-20)
- [ ] Tournament system
- [ ] Betting system
- [ ] NFT marketplace
- [ ] Social features
- [ ] Leaderboards

### Phase 4: Optimization & Launch (Weeks 21-28)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] DAO governance
- [ ] VR/AR integration
- [ ] Public launch

---

## 📝 CODING STANDARDS

### TypeScript:
```typescript
// Strict mode enabled
// Use interfaces for types
// Avoid any type
// Use proper error handling
// Add JSDoc comments for public functions
```

### Code Style:
```
- ESLint configuration
- Prettier formatting
- Husky pre-commit hooks
- 80-character line length
- 2-space indentation
```

### Testing:
```
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Cypress/Playwright
- Coverage: >80% for critical modules
- Test naming: describe/it pattern
```

### Git Workflow:
```
- Branch naming: feature/*, fix/*, refactor/*
- Commit messages: [TYPE] Description
- PR template with checklist
- Code review required before merge
- Squash commits on merge
```

---

## 🛠️ DEVELOPMENT INSTRUCTIONS FOR CLAUDE CODE

### How to use this prompt:

1. **Read this entire document first** - understand the full architecture and requirements
2. **Start with Phase 1** - foundation and infrastructure
3. **Follow the module order** - each module builds on previous ones
4. **Implement one feature at a time** - complete, test, then move to next
5. **Use the database schema** - create migrations for each module
6. **Write tests** - unit tests for logic, integration tests for APIs
7. **Document as you go** - update API docs, add comments
8. **Follow coding standards** - ESLint, Prettier, TypeScript strict

### For each module:

1. **Create database schema** - tables, indexes, constraints
2. **Implement API endpoints** - REST/GraphQL
3. **Add business logic** - services, utilities
4. **Integrate blockchain** - smart contracts, wallet operations
5. **Build frontend** - components, pages, forms
6. **Write tests** - unit, integration, E2E
7. **Document** - API docs, code comments, README

### Tech Stack Reminders:

**Backend:**
- Supabase (PostgreSQL 17, Auth, Realtime, Storage)
- n8n for workflows and automations
- Redis for caching and real-time state
- Solana for blockchain operations

**Frontend:**
- Next.js 14+ with TypeScript
- React Native for mobile
- Tailwind CSS + shadcn/ui
- Zustand for state management

**Real-time:**
- WebRTC for video/audio streaming
- Socket.io for signaling
- Supabase Realtime for database updates

**Blockchain:**
- Solana blockchain
- Anchor framework for smart contracts
- Web3.js for integration
- Metaplex for NFTs

### Important Notes:

1. **Security first** - validate all inputs, use RLS, encrypt sensitive data
2. **Performance matters** - optimize queries, use indexes, implement caching
3. **Scalability** - design for horizontal scaling, use queues for heavy operations
4. **Testing** - write tests as you code, aim for >80% coverage
5. **Documentation** - keep API docs updated, add inline comments
6. **Monitoring** - integrate Sentry, set up logging, create alerts

---

## 📞 SUPPORT AND CONTEXT

This prompt contains everything you need to know about ArenaHUB. It includes:
- ✅ Complete architecture and design
- ✅ All 7 major modules with detailed specs
- ✅ Database schema for all modules
- ✅ API endpoints for all features
- ✅ Smart contract specifications
- ✅ Development roadmap
- ✅ Coding standards
- ✅ Security and compliance requirements

**You have full context to:**
- Build any module independently
- Understand how modules interact
- Make architectural decisions
- Optimize for performance
- Implement security measures
- Write comprehensive tests
- Deploy to production

**Start coding now!** Pick a module from Phase 1 and begin implementation. You have everything you need.

---

**Last Updated:** October 22, 2025
**Project:** ArenaHUB
**Status:** Ready for Development
**Target Launch:** Q3 2026

