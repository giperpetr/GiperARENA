-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.betting_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID REFERENCES arenahub.game_sessions(id),
    tournament_id UUID REFERENCES arenahub.tournaments(id),
    market_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'suspended', 'closed', 'settled')),
    total_volume DECIMAL(15, 2) DEFAULT 0,
    outcome JSONB,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arenahub.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES arenahub.betting_markets(id),
    user_id UUID NOT NULL REFERENCES arenahub.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    odds DECIMAL(10, 2) NOT NULL,
    prediction JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
    payout DECIMAL(10, 2),
    transaction_hash TEXT,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX idx_betting_markets_status ON arenahub.betting_markets(status);
CREATE INDEX idx_bets_user_id ON arenahub.bets(user_id);
CREATE INDEX idx_bets_market_id ON arenahub.bets(market_id);
CREATE INDEX idx_bets_status ON arenahub.bets(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS arenahub.bets CASCADE;
DROP TABLE IF EXISTS arenahub.betting_markets CASCADE;
-- +goose StatementEnd
