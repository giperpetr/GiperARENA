-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON arenahub.users(username);
CREATE INDEX idx_users_email ON arenahub.users(email);
CREATE INDEX idx_users_wallet_address ON arenahub.users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_created_at ON arenahub.users(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION arenahub.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON arenahub.users
    FOR EACH ROW
    EXECUTE FUNCTION arenahub.update_updated_at_column();

-- Add comments
COMMENT ON TABLE arenahub.users IS 'User accounts and profiles';
COMMENT ON COLUMN arenahub.users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN arenahub.users.username IS 'Unique username for display';
COMMENT ON COLUMN arenahub.users.email IS 'User email address';
COMMENT ON COLUMN arenahub.users.wallet_address IS 'Solana wallet address (optional)';
COMMENT ON COLUMN arenahub.users.metadata IS 'Additional user metadata (JSON)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_users_updated_at ON arenahub.users;
DROP FUNCTION IF EXISTS arenahub.update_updated_at_column();
DROP TABLE IF EXISTS arenahub.users CASCADE;
-- +goose StatementEnd
