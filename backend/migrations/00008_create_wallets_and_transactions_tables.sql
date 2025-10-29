-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES giperarena.users(id) ON DELETE CASCADE,
    gac_balance DECIMAL(20, 8) DEFAULT 0,
    pac_balance DECIMAL(20, 8) DEFAULT 0,
    staked_gac DECIMAL(20, 8) DEFAULT 0,
    staking_tier VARCHAR(20) CHECK (staking_tier IN ('none', 'bronze', 'silver', 'gold', 'platinum')),
    total_earned DECIMAL(20, 8) DEFAULT 0,
    total_spent DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giperarena.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'game_fee', 'game_reward', 'bet', 'bet_payout', 'nft_purchase', 'nft_sale', 'stake', 'unstake', 'reward')),
    token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('GAC', 'PAC', 'SOL')),
    amount DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
    blockchain_tx_hash TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON giperarena.wallets(user_id);
CREATE INDEX idx_transactions_user_id ON giperarena.transactions(user_id);
CREATE INDEX idx_transactions_type ON giperarena.transactions(transaction_type);
CREATE INDEX idx_transactions_status ON giperarena.transactions(status);
CREATE INDEX idx_transactions_created_at ON giperarena.transactions(created_at DESC);

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON giperarena.wallets
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS giperarena.transactions CASCADE;
DROP TABLE IF EXISTS giperarena.wallets CASCADE;
-- +goose StatementEnd
