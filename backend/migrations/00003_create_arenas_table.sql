-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    operator_id UUID NOT NULL REFERENCES arenahub.users(id) ON DELETE CASCADE,
    location_address TEXT,
    location_coordinates GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'maintenance', 'offline', 'suspended')),
    arena_type VARCHAR(50) NOT NULL,
    price_per_minute DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PAC',
    max_players INTEGER DEFAULT 1,
    operating_hours JSONB,
    features JSONB DEFAULT '[]'::jsonb,
    equipment JSONB DEFAULT '[]'::jsonb,
    media_urls JSONB DEFAULT '{"images": [], "videos": []}'::jsonb,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_games INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_arenas_operator_id ON arenahub.arenas(operator_id);
CREATE INDEX idx_arenas_status ON arenahub.arenas(status);
CREATE INDEX idx_arenas_arena_type ON arenahub.arenas(arena_type);
CREATE INDEX idx_arenas_rating ON arenahub.arenas(rating DESC);
CREATE INDEX idx_arenas_location ON arenahub.arenas USING GIST(location_coordinates);
CREATE INDEX idx_arenas_created_at ON arenahub.arenas(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_arenas_updated_at
    BEFORE UPDATE ON arenahub.arenas
    FOR EACH ROW
    EXECUTE FUNCTION arenahub.update_updated_at_column();

COMMENT ON TABLE arenahub.arenas IS 'Physical arena locations with robotic devices';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_arenas_updated_at ON arenahub.arenas;
DROP TABLE IF EXISTS arenahub.arenas CASCADE;
-- +goose StatementEnd
