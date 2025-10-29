-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS giperarena.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giperarena.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id),
    leaderboard_type VARCHAR(50) NOT NULL CHECK (leaderboard_type IN ('global', 'arena', 'tournament', 'weekly', 'monthly')),
    score INTEGER NOT NULL,
    rank INTEGER,
    period VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_friendships_user_id ON giperarena.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON giperarena.friendships(friend_id);
CREATE INDEX idx_achievements_user_id ON giperarena.achievements(user_id);
CREATE INDEX idx_leaderboards_type_rank ON giperarena.leaderboards(leaderboard_type, rank);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS giperarena.leaderboards CASCADE;
DROP TABLE IF EXISTS giperarena.achievements CASCADE;
DROP TABLE IF EXISTS giperarena.friendships CASCADE;
-- +goose StatementEnd
