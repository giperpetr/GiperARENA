-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.game_replays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES giperarena.game_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    arena_id UUID NOT NULL REFERENCES giperarena.arenas(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    file_size_bytes BIGINT NOT NULL,
    resolution VARCHAR(20),
    fps INTEGER,
    codec VARCHAR(50),
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'processing', 'completed', 'failed'
    )),
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_highlight BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    game_metadata JSONB DEFAULT '{}'::jsonb,
    quality_variants JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for replay views tracking
CREATE TABLE IF NOT EXISTS giperarena.game_replay_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    replay_id UUID NOT NULL REFERENCES giperarena.game_replays(id) ON DELETE CASCADE,
    user_id UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    watch_duration_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for replay likes
CREATE TABLE IF NOT EXISTS giperarena.game_replay_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    replay_id UUID NOT NULL REFERENCES giperarena.game_replays(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_replay_like UNIQUE (user_id, replay_id)
);

-- Indexes for game_replays
CREATE INDEX idx_game_replays_session_id ON giperarena.game_replays(session_id);
CREATE INDEX idx_game_replays_player_id ON giperarena.game_replays(player_id);
CREATE INDEX idx_game_replays_arena_id ON giperarena.game_replays(arena_id);
CREATE INDEX idx_game_replays_is_public ON giperarena.game_replays(is_public) WHERE is_public = true;
CREATE INDEX idx_game_replays_is_featured ON giperarena.game_replays(is_featured) WHERE is_featured = true;
CREATE INDEX idx_game_replays_is_highlight ON giperarena.game_replays(is_highlight) WHERE is_highlight = true;
CREATE INDEX idx_game_replays_created_at ON giperarena.game_replays(created_at DESC);
CREATE INDEX idx_game_replays_view_count ON giperarena.game_replays(view_count DESC);
CREATE INDEX idx_game_replays_like_count ON giperarena.game_replays(like_count DESC);
CREATE INDEX idx_game_replays_tags ON giperarena.game_replays USING GIN(tags);
CREATE INDEX idx_game_replays_processing_status ON giperarena.game_replays(processing_status) WHERE processing_status != 'completed';

-- Indexes for game_replay_views
CREATE INDEX idx_game_replay_views_replay_id ON giperarena.game_replay_views(replay_id);
CREATE INDEX idx_game_replay_views_user_id ON giperarena.game_replay_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_game_replay_views_created_at ON giperarena.game_replay_views(created_at DESC);

-- Indexes for game_replay_likes
CREATE INDEX idx_game_replay_likes_replay_id ON giperarena.game_replay_likes(replay_id);
CREATE INDEX idx_game_replay_likes_user_id ON giperarena.game_replay_likes(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_game_replay_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_game_replays_updated_at
    BEFORE UPDATE ON giperarena.game_replays
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_game_replay_updated_at();

-- Trigger to increment view count
CREATE OR REPLACE FUNCTION giperarena.increment_replay_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE giperarena.game_replays
    SET view_count = view_count + 1
    WHERE id = NEW.replay_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_replay_view_count
    AFTER INSERT ON giperarena.game_replay_views
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.increment_replay_view_count();

-- Trigger to update like count
CREATE OR REPLACE FUNCTION giperarena.update_replay_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE giperarena.game_replays
        SET like_count = like_count + 1
        WHERE id = NEW.replay_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE giperarena.game_replays
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.replay_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_replay_like_count
    AFTER INSERT OR DELETE ON giperarena.game_replay_likes
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_replay_like_count();

COMMENT ON TABLE giperarena.game_replays IS 'Video recordings of game sessions stored in MinIO';
COMMENT ON TABLE giperarena.game_replay_views IS 'View tracking for replays';
COMMENT ON TABLE giperarena.game_replay_likes IS 'User likes on replays';
COMMENT ON COLUMN giperarena.game_replays.video_url IS 'MinIO URL to replay video file';
COMMENT ON COLUMN giperarena.game_replays.quality_variants IS 'JSON with different quality versions (1080p, 720p, 480p, etc.)';
COMMENT ON COLUMN giperarena.game_replays.game_metadata IS 'JSON with game stats, highlights timestamps, achievements earned';
COMMENT ON COLUMN giperarena.game_replays.is_highlight IS 'Marked as highlight by user or auto-detected (epic moments)';
COMMENT ON COLUMN giperarena.game_replays.tags IS 'Tags for search (epic, funny, fail, clutch, etc.)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_game_replays_updated_at ON giperarena.game_replays;
DROP TRIGGER IF EXISTS trigger_increment_replay_view_count ON giperarena.game_replay_views;
DROP TRIGGER IF EXISTS trigger_update_replay_like_count ON giperarena.game_replay_likes;
DROP FUNCTION IF EXISTS giperarena.update_game_replay_updated_at();
DROP FUNCTION IF EXISTS giperarena.increment_replay_view_count();
DROP FUNCTION IF EXISTS giperarena.update_replay_like_count();
DROP TABLE IF EXISTS giperarena.game_replay_likes CASCADE;
DROP TABLE IF EXISTS giperarena.game_replay_views CASCADE;
DROP TABLE IF EXISTS giperarena.game_replays CASCADE;
-- +goose StatementEnd
