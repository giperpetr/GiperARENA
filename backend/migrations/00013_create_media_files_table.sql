-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN (
        'avatar', 'video', 'replay', 'document', 'image', 'thumbnail', 'banner'
    )),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN (
        'user', 'arena', 'session', 'tournament', 'device'
    )),
    entity_id UUID NOT NULL,
    bucket VARCHAR(50) DEFAULT 'giperarena',
    path TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN (
        'pending', 'processing', 'completed', 'failed'
    )),
    thumbnail_path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_by UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_files_entity ON giperarena.media_files(entity_type, entity_id);
CREATE INDEX idx_media_files_uploaded_by ON giperarena.media_files(uploaded_by);
CREATE INDEX idx_media_files_file_type ON giperarena.media_files(file_type);
CREATE INDEX idx_media_files_created_at ON giperarena.media_files(created_at DESC);
CREATE INDEX idx_media_files_processing_status ON giperarena.media_files(processing_status) WHERE processing_status != 'completed';

COMMENT ON TABLE giperarena.media_files IS 'Metadata for all files stored in MinIO';
COMMENT ON COLUMN giperarena.media_files.path IS 'Full path in MinIO bucket (e.g. users/avatars/{user_id}/avatar.jpg)';
COMMENT ON COLUMN giperarena.media_files.entity_type IS 'Type of entity this file belongs to';
COMMENT ON COLUMN giperarena.media_files.entity_id IS 'ID of the entity (user_id, arena_id, etc.)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS giperarena.media_files CASCADE;
-- +goose StatementEnd
