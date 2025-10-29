-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.betting_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID REFERENCES giperarena.game_sessions(id),
    tournament_id UUID REFERENCES giperarena.tournaments(id),
    market_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'suspended', 'closed', 'settled')),
    total_volume DECIMAL(15, 2) DEFAULT 0,
    outcome JSONB,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giperarena.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES giperarena.betting_markets(id),
    user_id UUID NOT NULL REFERENCES giperarena.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    odds DECIMAL(10, 2) NOT NULL,
    prediction JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
    payout DECIMAL(10, 2),
    transaction_hash TEXT,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX idx_betting_markets_status ON giperarena.betting_markets(status);
CREATE INDEX idx_bets_user_id ON giperarena.bets(user_id);
CREATE INDEX idx_bets_market_id ON giperarena.bets(market_id);
CREATE INDEX idx_bets_status ON giperarena.bets(status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS giperarena.bets CASCADE;
DROP TABLE IF EXISTS giperarena.betting_markets CASCADE;
-- +goose StatementEnd
