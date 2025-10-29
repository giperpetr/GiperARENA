-- +goose Up
-- +goose StatementBegin
-- Achievement catalog
CREATE TABLE IF NOT EXISTS giperarena.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'gameplay', 'social', 'tournament', 'collection', 'special', 'seasonal'
    )),
    tier VARCHAR(20) NOT NULL CHECK (tier IN (
        'bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'
    )),
    icon_url TEXT,
    badge_url TEXT,
    requirements JSONB NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    pac_reward DECIMAL(20, 2) DEFAULT 0,
    gac_reward DECIMAL(20, 8) DEFAULT 0,
    reputation_reward INTEGER DEFAULT 0,
    is_secret BOOLEAN DEFAULT false,
    is_limited BOOLEAN DEFAULT false,
    max_earners INTEGER,
    current_earners INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievement progress and unlocks
CREATE TABLE IF NOT EXISTS giperarena.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES giperarena.achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}'::jsonb,
    progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    is_showcased BOOLEAN DEFAULT false,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- Indexes for achievements
CREATE INDEX idx_achievements_category ON giperarena.achievements(category);
CREATE INDEX idx_achievements_tier ON giperarena.achievements(tier);
CREATE INDEX idx_achievements_slug ON giperarena.achievements(slug);
CREATE INDEX idx_achievements_is_active ON giperarena.achievements(is_active) WHERE is_active = true;
CREATE INDEX idx_achievements_is_secret ON giperarena.achievements(is_secret) WHERE is_secret = true;
CREATE INDEX idx_achievements_sort_order ON giperarena.achievements(sort_order);

-- Indexes for user_achievements
CREATE INDEX idx_user_achievements_user_id ON giperarena.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON giperarena.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON giperarena.user_achievements(unlocked) WHERE unlocked = true;
CREATE INDEX idx_user_achievements_unlocked_at ON giperarena.user_achievements(unlocked_at DESC) WHERE unlocked_at IS NOT NULL;
CREATE INDEX idx_user_achievements_is_showcased ON giperarena.user_achievements(is_showcased) WHERE is_showcased = true;
CREATE INDEX idx_user_achievements_progress_percentage ON giperarena.user_achievements(progress_percentage);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_user_achievement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_achievements_updated_at
    BEFORE UPDATE ON giperarena.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_user_achievement_updated_at();

-- Trigger to handle achievement unlock
CREATE OR REPLACE FUNCTION giperarena.process_achievement_unlock()
RETURNS TRIGGER AS $$
DECLARE
    v_achievement RECORD;
    v_pac_reward DECIMAL(20, 2);
    v_gac_reward DECIMAL(20, 8);
    v_reputation_reward INTEGER;
BEGIN
    -- Only process if achievement was just unlocked
    IF NEW.unlocked = true AND (OLD.unlocked IS NULL OR OLD.unlocked = false) THEN
        -- Get achievement details
        SELECT * INTO v_achievement
        FROM giperarena.achievements
        WHERE id = NEW.achievement_id;

        -- Set unlock timestamp
        NEW.unlocked_at := NOW();

        -- Increment earners count
        UPDATE giperarena.achievements
        SET current_earners = current_earners + 1
        WHERE id = NEW.achievement_id;

        -- Award PAC tokens
        IF v_achievement.pac_reward > 0 THEN
            UPDATE giperarena.wallets
            SET pac_balance = pac_balance + v_achievement.pac_reward
            WHERE user_id = NEW.user_id;

            -- Log transaction
            INSERT INTO giperarena.transactions (
                user_id,
                transaction_type,
                currency,
                amount,
                status,
                description
            ) VALUES (
                NEW.user_id,
                'achievement_reward',
                'PAC',
                v_achievement.pac_reward,
                'completed',
                'Achievement reward: ' || v_achievement.name
            );
        END IF;

        -- Award GAC tokens
        IF v_achievement.gac_reward > 0 THEN
            UPDATE giperarena.wallets
            SET gac_balance = gac_balance + v_achievement.gac_reward
            WHERE user_id = NEW.user_id;

            INSERT INTO giperarena.transactions (
                user_id,
                transaction_type,
                currency,
                amount,
                status,
                description
            ) VALUES (
                NEW.user_id,
                'achievement_reward',
                'GAC',
                v_achievement.gac_reward,
                'completed',
                'Achievement reward: ' || v_achievement.name
            );
        END IF;

        -- Award reputation
        IF v_achievement.reputation_reward > 0 THEN
            UPDATE giperarena.users
            SET reputation_score = reputation_score + v_achievement.reputation_reward
            WHERE id = NEW.user_id;
        END IF;

        -- Create notification
        INSERT INTO giperarena.notifications (
            user_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            NEW.user_id,
            'achievement_unlocked',
            'Achievement Unlocked!',
            'You unlocked: ' || v_achievement.name,
            jsonb_build_object(
                'achievement_id', v_achievement.id,
                'achievement_name', v_achievement.name,
                'tier', v_achievement.tier
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_achievement_unlock
    BEFORE UPDATE ON giperarena.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.process_achievement_unlock();

-- Function to check and update achievement progress
CREATE OR REPLACE FUNCTION giperarena.check_achievement_progress(
    p_user_id UUID,
    p_achievement_slug VARCHAR
)
RETURNS void AS $$
DECLARE
    v_achievement_id UUID;
    v_requirements JSONB;
    v_progress JSONB;
    v_is_complete BOOLEAN := true;
    v_total_progress DECIMAL := 0;
    v_requirement_count INTEGER := 0;
BEGIN
    -- Get achievement
    SELECT id, requirements INTO v_achievement_id, v_requirements
    FROM giperarena.achievements
    WHERE slug = p_achievement_slug
    AND is_active = true;

    IF v_achievement_id IS NULL THEN
        RETURN;
    END IF;

    -- Ensure user achievement record exists
    INSERT INTO giperarena.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, v_achievement_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Here you would implement custom logic to check requirements
    -- This is a simplified example
    -- Real implementation would check specific game stats, etc.

END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE giperarena.achievements IS 'Catalog of all achievements players can unlock';
COMMENT ON TABLE giperarena.user_achievements IS 'User progress and unlocked achievements';
COMMENT ON COLUMN giperarena.achievements.requirements IS 'JSON with achievement requirements (games_played, tournaments_won, etc.)';
COMMENT ON COLUMN giperarena.achievements.rewards IS 'JSON with additional rewards (NFTs, special items, etc.)';
COMMENT ON COLUMN giperarena.achievements.is_secret IS 'Hidden achievement not shown until unlocked';
COMMENT ON COLUMN giperarena.achievements.is_limited IS 'Limited edition (only N users can earn)';
COMMENT ON COLUMN giperarena.user_achievements.progress IS 'JSON tracking progress toward requirements';
COMMENT ON COLUMN giperarena.user_achievements.progress_percentage IS 'Overall completion percentage (0-100)';
COMMENT ON COLUMN giperarena.user_achievements.is_showcased IS 'User chose to showcase this achievement on profile';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_user_achievements_updated_at ON giperarena.user_achievements;
DROP TRIGGER IF EXISTS trigger_process_achievement_unlock ON giperarena.user_achievements;
DROP FUNCTION IF EXISTS giperarena.update_user_achievement_updated_at();
DROP FUNCTION IF EXISTS giperarena.process_achievement_unlock();
DROP FUNCTION IF EXISTS giperarena.check_achievement_progress(UUID, VARCHAR);
DROP TABLE IF EXISTS giperarena.user_achievements CASCADE;
DROP TABLE IF EXISTS giperarena.achievements CASCADE;
-- +goose StatementEnd
