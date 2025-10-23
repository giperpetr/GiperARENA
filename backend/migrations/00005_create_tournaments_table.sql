-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES arenahub.users(id),
    arena_id UUID REFERENCES arenahub.arenas(id),
    tournament_type VARCHAR(50) CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'in_progress', 'completed', 'cancelled')),
    entry_fee DECIMAL(10, 2),
    prize_pool DECIMAL(15, 2),
    prize_distribution JSONB,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    rules JSONB,
    bracket JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_status ON arenahub.tournaments(status);
CREATE INDEX idx_tournaments_start_date ON arenahub.tournaments(start_date DESC);
CREATE INDEX idx_tournaments_organizer_id ON arenahub.tournaments(organizer_id);

CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON arenahub.tournaments
    FOR EACH ROW
    EXECUTE FUNCTION arenahub.update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS arenahub.tournaments CASCADE;
-- +goose StatementEnd
