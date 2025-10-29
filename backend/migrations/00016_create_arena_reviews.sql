-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.arena_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID NOT NULL REFERENCES giperarena.arenas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES giperarena.game_sessions(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    device_quality_rating INTEGER CHECK (device_quality_rating BETWEEN 1 AND 5),
    connection_quality_rating INTEGER CHECK (connection_quality_rating BETWEEN 1 AND 5),
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    is_verified BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    admin_response TEXT,
    admin_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_arena_review UNIQUE (user_id, arena_id, session_id)
);

-- Table for tracking helpful/report votes on reviews
CREATE TABLE IF NOT EXISTS giperarena.arena_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES giperarena.arena_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('helpful', 'report')),
    reason VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id, vote_type)
);

-- Indexes for arena_reviews
CREATE INDEX idx_arena_reviews_arena_id ON giperarena.arena_reviews(arena_id);
CREATE INDEX idx_arena_reviews_user_id ON giperarena.arena_reviews(user_id);
CREATE INDEX idx_arena_reviews_session_id ON giperarena.arena_reviews(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_arena_reviews_rating ON giperarena.arena_reviews(rating);
CREATE INDEX idx_arena_reviews_is_verified ON giperarena.arena_reviews(is_verified) WHERE is_verified = true;
CREATE INDEX idx_arena_reviews_created_at ON giperarena.arena_reviews(created_at DESC);
CREATE INDEX idx_arena_reviews_helpful_count ON giperarena.arena_reviews(helpful_count DESC);

-- Indexes for arena_review_votes
CREATE INDEX idx_arena_review_votes_review_id ON giperarena.arena_review_votes(review_id);
CREATE INDEX idx_arena_review_votes_user_id ON giperarena.arena_review_votes(user_id);
CREATE INDEX idx_arena_review_votes_vote_type ON giperarena.arena_review_votes(vote_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_arena_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_arena_reviews_updated_at
    BEFORE UPDATE ON giperarena.arena_reviews
    FOR EACH ROW
    WHEN (OLD.review_text IS DISTINCT FROM NEW.review_text OR OLD.title IS DISTINCT FROM NEW.title)
    EXECUTE FUNCTION giperarena.update_arena_review_updated_at();

-- Trigger to update helpful/reported counts
CREATE OR REPLACE FUNCTION giperarena.update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'helpful' THEN
            UPDATE giperarena.arena_reviews
            SET helpful_count = helpful_count + 1
            WHERE id = NEW.review_id;
        ELSIF NEW.vote_type = 'report' THEN
            UPDATE giperarena.arena_reviews
            SET reported_count = reported_count + 1
            WHERE id = NEW.review_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'helpful' THEN
            UPDATE giperarena.arena_reviews
            SET helpful_count = GREATEST(helpful_count - 1, 0)
            WHERE id = OLD.review_id;
        ELSIF OLD.vote_type = 'report' THEN
            UPDATE giperarena.arena_reviews
            SET reported_count = GREATEST(reported_count - 1, 0)
            WHERE id = OLD.review_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_vote_counts
    AFTER INSERT OR DELETE ON giperarena.arena_review_votes
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_review_vote_counts();

-- Trigger to update arena average rating
CREATE OR REPLACE FUNCTION giperarena.update_arena_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_avg_rating DECIMAL(3,2);
    v_review_count INTEGER;
BEGIN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM giperarena.arena_reviews
    WHERE arena_id = COALESCE(NEW.arena_id, OLD.arena_id)
    AND is_verified = true;

    UPDATE giperarena.arenas
    SET rating = v_avg_rating,
        total_reviews = v_review_count
    WHERE id = COALESCE(NEW.arena_id, OLD.arena_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_arena_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON giperarena.arena_reviews
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_arena_rating();

COMMENT ON TABLE giperarena.arena_reviews IS 'User reviews and ratings for arenas';
COMMENT ON TABLE giperarena.arena_review_votes IS 'Helpful/report votes on arena reviews';
COMMENT ON COLUMN giperarena.arena_reviews.is_verified IS 'Review verified by admin or auto-verified for users with completed sessions';
COMMENT ON COLUMN giperarena.arena_reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON COLUMN giperarena.arena_reviews.reported_count IS 'Number of reports for inappropriate content';
COMMENT ON COLUMN giperarena.arena_reviews.device_quality_rating IS 'Rating specifically for device condition/quality';
COMMENT ON COLUMN giperarena.arena_reviews.connection_quality_rating IS 'Rating for WebRTC connection quality/latency';
COMMENT ON COLUMN giperarena.arena_reviews.staff_rating IS 'Rating for arena staff service';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_arena_reviews_updated_at ON giperarena.arena_reviews;
DROP TRIGGER IF EXISTS trigger_update_review_vote_counts ON giperarena.arena_review_votes;
DROP TRIGGER IF EXISTS trigger_update_arena_rating_on_review ON giperarena.arena_reviews;
DROP FUNCTION IF EXISTS giperarena.update_arena_review_updated_at();
DROP FUNCTION IF EXISTS giperarena.update_review_vote_counts();
DROP FUNCTION IF EXISTS giperarena.update_arena_rating();
DROP TABLE IF EXISTS giperarena.arena_review_votes CASCADE;
DROP TABLE IF EXISTS giperarena.arena_reviews CASCADE;
-- +goose StatementEnd
