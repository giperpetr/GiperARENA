-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS arenahub.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES arenahub.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON arenahub.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON arenahub.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON arenahub.notifications(created_at DESC);

COMMENT ON TABLE arenahub.notifications IS 'User notifications and alerts';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS arenahub.notifications CASCADE;
-- +goose StatementEnd
