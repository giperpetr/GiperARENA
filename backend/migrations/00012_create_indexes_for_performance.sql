-- +goose Up
-- +goose StatementBegin
-- Additional composite indexes for common queries

-- User activity tracking
CREATE INDEX idx_game_sessions_player_status ON arenahub.game_sessions(player_id, status);
CREATE INDEX idx_game_sessions_arena_status ON arenahub.game_sessions(arena_id, status);

-- Arena discovery
CREATE INDEX idx_arenas_status_rating ON arenahub.arenas(status, rating DESC);
CREATE INDEX idx_arenas_type_status ON arenahub.arenas(arena_type, status);

-- Tournament queries
CREATE INDEX idx_tournaments_status_start ON arenahub.tournaments(status, start_date DESC);

-- Betting queries
CREATE INDEX idx_bets_user_status ON arenahub.bets(user_id, status);
CREATE INDEX idx_betting_markets_status_created ON arenahub.betting_markets(status, created_at DESC);

-- Wallet operations
CREATE INDEX idx_transactions_user_type_created ON arenahub.transactions(user_id, transaction_type, created_at DESC);

-- NFT marketplace
CREATE INDEX idx_nfts_listed_price ON arenahub.nfts(is_listed, list_price) WHERE is_listed = true;

-- Leaderboard queries
CREATE INDEX idx_leaderboards_type_period_rank ON arenahub.leaderboards(leaderboard_type, period, rank);

-- Full-text search on arenas
CREATE INDEX idx_arenas_name_search ON arenahub.arenas USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

COMMENT ON INDEX idx_arenas_name_search IS 'Full-text search index for arena name and description';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS arenahub.idx_game_sessions_player_status;
DROP INDEX IF EXISTS arenahub.idx_game_sessions_arena_status;
DROP INDEX IF EXISTS arenahub.idx_arenas_status_rating;
DROP INDEX IF EXISTS arenahub.idx_arenas_type_status;
DROP INDEX IF EXISTS arenahub.idx_tournaments_status_start;
DROP INDEX IF EXISTS arenahub.idx_bets_user_status;
DROP INDEX IF EXISTS arenahub.idx_betting_markets_status_created;
DROP INDEX IF EXISTS arenahub.idx_transactions_user_type_created;
DROP INDEX IF EXISTS arenahub.idx_nfts_listed_price;
DROP INDEX IF EXISTS arenahub.idx_leaderboards_type_period_rank;
DROP INDEX IF EXISTS arenahub.idx_arenas_name_search;
-- +goose StatementEnd
