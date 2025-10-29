-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN (
        'global', 'arena', 'tournament', 'session', 'private', 'support'
    )),
    related_entity_id UUID,
    recipient_id UUID REFERENCES giperarena.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN (
        'text', 'image', 'video', 'replay_share', 'achievement_share', 'system'
    )),
    media_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    is_system_message BOOLEAN DEFAULT false,
    reply_to_message_id UUID REFERENCES giperarena.chat_messages(id) ON DELETE SET NULL,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN (
        'pending', 'approved', 'flagged', 'hidden'
    )),
    flagged_by UUID[] DEFAULT '{}',
    flagged_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking read receipts
CREATE TABLE IF NOT EXISTS giperarena.chat_message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES giperarena.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_message_read UNIQUE (message_id, user_id)
);

-- Table for chat reactions
CREATE TABLE IF NOT EXISTS giperarena.chat_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES giperarena.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN (
        'like', 'love', 'laugh', 'wow', 'sad', 'angry', 'fire', 'trophy'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_message_reaction UNIQUE (message_id, user_id, reaction_type)
);

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_sender_id ON giperarena.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_chat_type ON giperarena.chat_messages(chat_type);
CREATE INDEX idx_chat_messages_related_entity_id ON giperarena.chat_messages(related_entity_id) WHERE related_entity_id IS NOT NULL;
CREATE INDEX idx_chat_messages_recipient_id ON giperarena.chat_messages(recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX idx_chat_messages_created_at ON giperarena.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_is_deleted ON giperarena.chat_messages(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_chat_messages_moderation_status ON giperarena.chat_messages(moderation_status) WHERE moderation_status != 'approved';
CREATE INDEX idx_chat_messages_reply_to ON giperarena.chat_messages(reply_to_message_id) WHERE reply_to_message_id IS NOT NULL;
CREATE INDEX idx_chat_messages_message_type ON giperarena.chat_messages(message_type);

-- Composite index for chat queries
CREATE INDEX idx_chat_messages_type_entity ON giperarena.chat_messages(chat_type, related_entity_id, created_at DESC) WHERE is_deleted = false;

-- Index for private chat queries
CREATE INDEX idx_chat_messages_private ON giperarena.chat_messages(sender_id, recipient_id, created_at DESC) WHERE chat_type = 'private' AND is_deleted = false;

-- Indexes for chat_message_reads
CREATE INDEX idx_chat_message_reads_message_id ON giperarena.chat_message_reads(message_id);
CREATE INDEX idx_chat_message_reads_user_id ON giperarena.chat_message_reads(user_id);
CREATE INDEX idx_chat_message_reads_read_at ON giperarena.chat_message_reads(read_at DESC);

-- Indexes for chat_message_reactions
CREATE INDEX idx_chat_message_reactions_message_id ON giperarena.chat_message_reactions(message_id);
CREATE INDEX idx_chat_message_reactions_user_id ON giperarena.chat_message_reactions(user_id);
CREATE INDEX idx_chat_message_reactions_reaction_type ON giperarena.chat_message_reactions(reaction_type);

-- Function to get unread message count
CREATE OR REPLACE FUNCTION giperarena.get_unread_message_count(
    p_user_id UUID,
    p_chat_type VARCHAR DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM giperarena.chat_messages cm
    WHERE (
        (cm.chat_type = 'private' AND cm.recipient_id = p_user_id)
        OR (cm.chat_type != 'private' AND p_chat_type IS NOT NULL AND cm.chat_type = p_chat_type)
    )
    AND (p_entity_id IS NULL OR cm.related_entity_id = p_entity_id)
    AND cm.is_deleted = false
    AND NOT EXISTS (
        SELECT 1
        FROM giperarena.chat_message_reads cmr
        WHERE cmr.message_id = cm.id
        AND cmr.user_id = p_user_id
    );

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION giperarena.mark_messages_as_read(
    p_user_id UUID,
    p_message_ids UUID[]
)
RETURNS void AS $$
BEGIN
    INSERT INTO giperarena.chat_message_reads (message_id, user_id)
    SELECT UNNEST(p_message_ids), p_user_id
    ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to get chat history
CREATE OR REPLACE FUNCTION giperarena.get_chat_history(
    p_chat_type VARCHAR,
    p_entity_id UUID DEFAULT NULL,
    p_user1_id UUID DEFAULT NULL,
    p_user2_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    sender_username VARCHAR,
    sender_avatar_url TEXT,
    message_text TEXT,
    message_type VARCHAR,
    media_url TEXT,
    metadata JSONB,
    is_edited BOOLEAN,
    reply_to_message_id UUID,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.id,
        cm.sender_id,
        u.username,
        u.avatar_url,
        cm.message_text,
        cm.message_type,
        cm.media_url,
        cm.metadata,
        cm.is_edited,
        cm.reply_to_message_id,
        cm.created_at
    FROM giperarena.chat_messages cm
    JOIN giperarena.users u ON u.id = cm.sender_id
    WHERE cm.chat_type = p_chat_type
    AND cm.is_deleted = false
    AND cm.moderation_status = 'approved'
    AND (
        (p_chat_type = 'private' AND (
            (cm.sender_id = p_user1_id AND cm.recipient_id = p_user2_id)
            OR (cm.sender_id = p_user2_id AND cm.recipient_id = p_user1_id)
        ))
        OR (p_chat_type != 'private' AND (p_entity_id IS NULL OR cm.related_entity_id = p_entity_id))
    )
    ORDER BY cm.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update users' last_active timestamp on message send
CREATE OR REPLACE FUNCTION giperarena.update_user_last_active_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE giperarena.users
    SET last_active_at = NOW()
    WHERE id = NEW.sender_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_last_active_on_message
    AFTER INSERT ON giperarena.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_user_last_active_on_message();

COMMENT ON TABLE giperarena.chat_messages IS 'All chat messages (global, arena, tournament, private, support)';
COMMENT ON TABLE giperarena.chat_message_reads IS 'Read receipts for chat messages';
COMMENT ON TABLE giperarena.chat_message_reactions IS 'Emoji reactions to chat messages';
COMMENT ON COLUMN giperarena.chat_messages.chat_type IS 'Type of chat (global, arena-specific, tournament, game session, private DM)';
COMMENT ON COLUMN giperarena.chat_messages.related_entity_id IS 'ID of arena, tournament, or session this message belongs to';
COMMENT ON COLUMN giperarena.chat_messages.recipient_id IS 'For private messages - recipient user ID';
COMMENT ON COLUMN giperarena.chat_messages.message_type IS 'text, image, video, replay share, achievement share, or system message';
COMMENT ON COLUMN giperarena.chat_messages.metadata IS 'JSON with shared content details (replay ID, achievement ID, etc.)';
COMMENT ON COLUMN giperarena.chat_messages.moderation_status IS 'Moderation status for spam/abuse detection';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_update_user_last_active_on_message ON giperarena.chat_messages;
DROP FUNCTION IF EXISTS giperarena.update_user_last_active_on_message();
DROP FUNCTION IF EXISTS giperarena.get_unread_message_count(UUID, VARCHAR, UUID);
DROP FUNCTION IF EXISTS giperarena.mark_messages_as_read(UUID, UUID[]);
DROP FUNCTION IF EXISTS giperarena.get_chat_history(VARCHAR, UUID, UUID, UUID, INTEGER, INTEGER);
DROP TABLE IF EXISTS giperarena.chat_message_reactions CASCADE;
DROP TABLE IF EXISTS giperarena.chat_message_reads CASCADE;
DROP TABLE IF EXISTS giperarena.chat_messages CASCADE;
-- +goose StatementEnd
