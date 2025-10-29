-- +goose Up
-- +goose StatementBegin
-- User friends (social connections)
CREATE TABLE IF NOT EXISTS giperarena.user_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'rejected', 'cancelled'
    )),
    requested_by UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT no_self_friend CHECK (user_id != friend_id)
);

-- User blocks (blocked users)
CREATE TABLE IF NOT EXISTS giperarena.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id),
    CONSTRAINT no_self_block CHECK (user_id != blocked_user_id)
);

-- Indexes for user_friends
CREATE INDEX idx_user_friends_user_id ON giperarena.user_friends(user_id);
CREATE INDEX idx_user_friends_friend_id ON giperarena.user_friends(friend_id);
CREATE INDEX idx_user_friends_status ON giperarena.user_friends(status);
CREATE INDEX idx_user_friends_requested_by ON giperarena.user_friends(requested_by);
CREATE INDEX idx_user_friends_requested_at ON giperarena.user_friends(requested_at DESC);

-- Composite index for friend queries
CREATE INDEX idx_user_friends_user_status ON giperarena.user_friends(user_id, status);

-- Indexes for user_blocks
CREATE INDEX idx_user_blocks_user_id ON giperarena.user_blocks(user_id);
CREATE INDEX idx_user_blocks_blocked_user_id ON giperarena.user_blocks(blocked_user_id);
CREATE INDEX idx_user_blocks_created_at ON giperarena.user_blocks(created_at DESC);

-- Function to send friend request
CREATE OR REPLACE FUNCTION giperarena.send_friend_request(
    p_from_user_id UUID,
    p_to_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_friendship_id UUID;
    v_existing_request UUID;
BEGIN
    -- Check if already friends or pending request exists
    SELECT id INTO v_existing_request
    FROM giperarena.user_friends
    WHERE (user_id = p_from_user_id AND friend_id = p_to_user_id)
       OR (user_id = p_to_user_id AND friend_id = p_from_user_id)
    LIMIT 1;

    IF v_existing_request IS NOT NULL THEN
        RAISE EXCEPTION 'Friend request already exists or users are already friends';
    END IF;

    -- Check if blocked
    IF EXISTS (
        SELECT 1 FROM giperarena.user_blocks
        WHERE (user_id = p_from_user_id AND blocked_user_id = p_to_user_id)
           OR (user_id = p_to_user_id AND blocked_user_id = p_from_user_id)
    ) THEN
        RAISE EXCEPTION 'Cannot send friend request to blocked user';
    END IF;

    -- Create friend request
    INSERT INTO giperarena.user_friends (
        user_id,
        friend_id,
        status,
        requested_by
    ) VALUES (
        p_from_user_id,
        p_to_user_id,
        'pending',
        p_from_user_id
    ) RETURNING id INTO v_friendship_id;

    -- Create notification
    INSERT INTO giperarena.notifications (
        user_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        p_to_user_id,
        'friend_request',
        'New Friend Request',
        (SELECT username FROM giperarena.users WHERE id = p_from_user_id) || ' sent you a friend request',
        jsonb_build_object('friendship_id', v_friendship_id, 'from_user_id', p_from_user_id)
    );

    RETURN v_friendship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to accept friend request
CREATE OR REPLACE FUNCTION giperarena.accept_friend_request(p_friendship_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_friend_id UUID;
BEGIN
    -- Update request status
    UPDATE giperarena.user_friends
    SET status = 'accepted',
        accepted_at = NOW()
    WHERE id = p_friendship_id
    AND friend_id = p_user_id
    AND status = 'pending'
    RETURNING user_id INTO v_friend_id;

    IF v_friend_id IS NULL THEN
        RAISE EXCEPTION 'Friend request not found or already processed';
    END IF;

    -- Create notification for requester
    INSERT INTO giperarena.notifications (
        user_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        v_friend_id,
        'friend_accepted',
        'Friend Request Accepted',
        (SELECT username FROM giperarena.users WHERE id = p_user_id) || ' accepted your friend request',
        jsonb_build_object('friendship_id', p_friendship_id, 'friend_id', p_user_id)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's friends
CREATE OR REPLACE FUNCTION giperarena.get_user_friends(p_user_id UUID)
RETURNS TABLE (
    friend_id UUID,
    friend_username VARCHAR,
    friend_avatar_url TEXT,
    friend_reputation_score INTEGER,
    friendship_date TIMESTAMPTZ,
    is_online BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN uf.user_id = p_user_id THEN uf.friend_id
            ELSE uf.user_id
        END as friend_id,
        u.username,
        u.avatar_url,
        u.reputation_score,
        uf.accepted_at,
        (u.last_active_at > NOW() - INTERVAL '5 minutes') as is_online
    FROM giperarena.user_friends uf
    JOIN giperarena.users u ON u.id = CASE
        WHEN uf.user_id = p_user_id THEN uf.friend_id
        ELSE uf.user_id
    END
    WHERE (uf.user_id = p_user_id OR uf.friend_id = p_user_id)
    AND uf.status = 'accepted'
    ORDER BY u.username;
END;
$$ LANGUAGE plpgsql;

-- Function to check if users are friends
CREATE OR REPLACE FUNCTION giperarena.are_friends(p_user_id1 UUID, p_user_id2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM giperarena.user_friends
        WHERE ((user_id = p_user_id1 AND friend_id = p_user_id2)
            OR (user_id = p_user_id2 AND friend_id = p_user_id1))
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to block user
CREATE OR REPLACE FUNCTION giperarena.block_user(
    p_user_id UUID,
    p_blocked_user_id UUID,
    p_reason VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_block_id UUID;
BEGIN
    -- Remove existing friendship if any
    DELETE FROM giperarena.user_friends
    WHERE (user_id = p_user_id AND friend_id = p_blocked_user_id)
       OR (user_id = p_blocked_user_id AND friend_id = p_user_id);

    -- Create block
    INSERT INTO giperarena.user_blocks (
        user_id,
        blocked_user_id,
        reason
    ) VALUES (
        p_user_id,
        p_blocked_user_id,
        p_reason
    ) RETURNING id INTO v_block_id;

    RETURN v_block_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION giperarena.is_user_blocked(p_user_id UUID, p_other_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM giperarena.user_blocks
        WHERE (user_id = p_user_id AND blocked_user_id = p_other_user_id)
           OR (user_id = p_other_user_id AND blocked_user_id = p_user_id)
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent friendship with blocked users
CREATE OR REPLACE FUNCTION giperarena.prevent_blocked_friendship()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM giperarena.user_blocks
        WHERE (user_id = NEW.user_id AND blocked_user_id = NEW.friend_id)
           OR (user_id = NEW.friend_id AND blocked_user_id = NEW.user_id)
    ) THEN
        RAISE EXCEPTION 'Cannot create friendship with blocked user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_blocked_friendship
    BEFORE INSERT ON giperarena.user_friends
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.prevent_blocked_friendship();

COMMENT ON TABLE giperarena.user_friends IS 'Friend connections between users';
COMMENT ON TABLE giperarena.user_blocks IS 'Blocked user relationships';
COMMENT ON COLUMN giperarena.user_friends.status IS 'pending = waiting for acceptance, accepted = friends, rejected/cancelled = declined';
COMMENT ON COLUMN giperarena.user_friends.requested_by IS 'User who initiated the friend request';
COMMENT ON COLUMN giperarena.user_blocks.reason IS 'Reason for blocking (harassment, spam, etc.)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_prevent_blocked_friendship ON giperarena.user_friends;
DROP FUNCTION IF EXISTS giperarena.send_friend_request(UUID, UUID);
DROP FUNCTION IF EXISTS giperarena.accept_friend_request(UUID, UUID);
DROP FUNCTION IF EXISTS giperarena.get_user_friends(UUID);
DROP FUNCTION IF EXISTS giperarena.are_friends(UUID, UUID);
DROP FUNCTION IF EXISTS giperarena.block_user(UUID, UUID, VARCHAR);
DROP FUNCTION IF EXISTS giperarena.is_user_blocked(UUID, UUID);
DROP FUNCTION IF EXISTS giperarena.prevent_blocked_friendship();
DROP TABLE IF EXISTS giperarena.user_blocks CASCADE;
DROP TABLE IF EXISTS giperarena.user_friends CASCADE;
-- +goose StatementEnd
