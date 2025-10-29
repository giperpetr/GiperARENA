-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID NOT NULL REFERENCES giperarena.arenas(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled', 'error')),
    game_mode VARCHAR(50),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    score INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb,
    replay_url TEXT,
    entry_fee DECIMAL(10, 2),
    prize_amount DECIMAL(10, 2),
    transaction_hash TEXT,
    control_latency_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_game_sessions_arena_id ON giperarena.game_sessions(arena_id);
CREATE INDEX idx_game_sessions_player_id ON giperarena.game_sessions(player_id);
CREATE INDEX idx_game_sessions_status ON giperarena.game_sessions(status);
CREATE INDEX idx_game_sessions_start_time ON giperarena.game_sessions(start_time DESC);
CREATE INDEX idx_game_sessions_created_at ON giperarena.game_sessions(created_at DESC);

-- Trigger
CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON giperarena.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_updated_at_column();

COMMENT ON TABLE giperarena.game_sessions IS 'Individual game sessions and matches';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON giperarena.game_sessions;
DROP TABLE IF EXISTS giperarena.game_sessions CASCADE;
-- +goose StatementEnd
