-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mint_address VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES giperarena.users(id),
    nft_type VARCHAR(50) CHECK (nft_type IN ('device', 'achievement', 'collectible', 'skin')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    metadata_uri TEXT,
    attributes JSONB,
    rarity VARCHAR(20),
    is_listed BOOLEAN DEFAULT FALSE,
    list_price DECIMAL(10, 2),
    royalty_percentage DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nfts_owner_id ON giperarena.nfts(owner_id);
CREATE INDEX idx_nfts_nft_type ON giperarena.nfts(nft_type);
CREATE INDEX idx_nfts_is_listed ON giperarena.nfts(is_listed);

CREATE TRIGGER update_nfts_updated_at
    BEFORE UPDATE ON giperarena.nfts
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS giperarena.nfts CASCADE;
-- +goose StatementEnd
