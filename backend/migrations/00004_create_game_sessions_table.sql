-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID NOT NULL REFERENCES arenahub.arenas(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES arenahub.users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_game_sessions_arena_id ON arenahub.game_sessions(arena_id);
CREATE INDEX idx_game_sessions_player_id ON arenahub.game_sessions(player_id);
CREATE INDEX idx_game_sessions_status ON arenahub.game_sessions(status);
CREATE INDEX idx_game_sessions_start_time ON arenahub.game_sessions(start_time DESC);
CREATE INDEX idx_game_sessions_created_at ON arenahub.game_sessions(created_at DESC);

-- Trigger
CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON arenahub.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION arenahub.update_updated_at_column();

COMMENT ON TABLE arenahub.game_sessions IS 'Individual game sessions and matches';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON arenahub.game_sessions;
DROP TABLE IF EXISTS arenahub.game_sessions CASCADE;
-- +goose StatementEnd
