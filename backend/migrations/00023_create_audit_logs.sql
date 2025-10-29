-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'user', 'arena', 'device', 'session', 'tournament', 'bet', 'nft',
        'wallet', 'transaction', 'achievement', 'review', 'kyc', 'payment',
        'notification', 'chat', 'setting', 'admin'
    )),
    entity_id UUID,
    changes JSONB DEFAULT '{}'::jsonb,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    session_id VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN (
        'debug', 'info', 'warning', 'error', 'critical'
    )),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN (
        'success', 'failure', 'pending'
    )),
    error_message TEXT,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioning by month for performance (optional, can be enabled later)
-- CREATE TABLE giperarena.audit_logs_y2025m01 PARTITION OF giperarena.audit_logs
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON giperarena.audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON giperarena.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON giperarena.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON giperarena.audit_logs(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON giperarena.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON giperarena.audit_logs(severity) WHERE severity IN ('error', 'critical');
CREATE INDEX idx_audit_logs_status ON giperarena.audit_logs(status) WHERE status = 'failure';
CREATE INDEX idx_audit_logs_ip_address ON giperarena.audit_logs(ip_address) WHERE ip_address IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_audit_logs_user_entity ON giperarena.audit_logs(user_id, entity_type, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_entity_action ON giperarena.audit_logs(entity_type, entity_id, action, created_at DESC) WHERE entity_id IS NOT NULL;

-- Function to log audit event
CREATE OR REPLACE FUNCTION giperarena.log_audit_event(
    p_user_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID DEFAULT NULL,
    p_changes JSONB DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_severity VARCHAR DEFAULT 'info',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO giperarena.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        changes,
        old_values,
        new_values,
        ip_address,
        user_agent,
        severity,
        metadata
    ) VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_changes,
        p_old_values,
        p_new_values,
        p_ip_address,
        p_user_agent,
        p_severity,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity history
CREATE OR REPLACE FUNCTION giperarena.get_user_activity(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    action VARCHAR,
    entity_type VARCHAR,
    entity_id UUID,
    changes JSONB,
    severity VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.changes,
        al.severity,
        al.created_at
    FROM giperarena.audit_logs al
    WHERE al.user_id = p_user_id
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get entity change history
CREATE OR REPLACE FUNCTION giperarena.get_entity_history(
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    username VARCHAR,
    action VARCHAR,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.user_id,
        u.username,
        al.action,
        al.old_values,
        al.new_values,
        al.created_at
    FROM giperarena.audit_logs al
    LEFT JOIN giperarena.users u ON u.id = al.user_id
    WHERE al.entity_type = p_entity_type
    AND al.entity_id = p_entity_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION giperarena.detect_suspicious_activity(
    p_user_id UUID,
    p_time_window_minutes INTEGER DEFAULT 5
)
RETURNS TABLE (
    activity_type VARCHAR,
    count BIGINT,
    first_occurrence TIMESTAMPTZ,
    last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.action,
        COUNT(*)::BIGINT,
        MIN(al.created_at),
        MAX(al.created_at)
    FROM giperarena.audit_logs al
    WHERE al.user_id = p_user_id
    AND al.created_at >= NOW() - (p_time_window_minutes || ' minutes')::INTERVAL
    GROUP BY al.action
    HAVING COUNT(*) > 20  -- Threshold for suspicious activity
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log sensitive table changes
CREATE OR REPLACE FUNCTION giperarena.auto_audit_sensitive_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_changes JSONB;
BEGIN
    -- Try to get user_id from session (would be set by application)
    BEGIN
        v_user_id := current_setting('app.current_user_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF TG_OP = 'DELETE' THEN
        PERFORM giperarena.log_audit_event(
            v_user_id,
            TG_TABLE_NAME || '_deleted',
            TG_TABLE_NAME,
            OLD.id,
            NULL,
            row_to_json(OLD)::JSONB,
            NULL
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        v_changes := jsonb_object_agg(
            key,
            jsonb_build_object('old', old_value, 'new', new_value)
        ) FROM (
            SELECT key, old_row.value as old_value, new_row.value as new_value
            FROM jsonb_each(row_to_json(OLD)::JSONB) old_row
            JOIN jsonb_each(row_to_json(NEW)::JSONB) new_row USING (key)
            WHERE old_row.value IS DISTINCT FROM new_row.value
        ) changes;

        IF v_changes IS NOT NULL THEN
            PERFORM giperarena.log_audit_event(
                v_user_id,
                TG_TABLE_NAME || '_updated',
                TG_TABLE_NAME,
                NEW.id,
                v_changes,
                row_to_json(OLD)::JSONB,
                row_to_json(NEW)::JSONB
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM giperarena.log_audit_event(
            v_user_id,
            TG_TABLE_NAME || '_created',
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            NULL,
            row_to_json(NEW)::JSONB
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER trigger_audit_wallets
    AFTER INSERT OR UPDATE OR DELETE ON giperarena.wallets
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.auto_audit_sensitive_changes();

CREATE TRIGGER trigger_audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON giperarena.transactions
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.auto_audit_sensitive_changes();

COMMENT ON TABLE giperarena.audit_logs IS 'Comprehensive audit trail of all system activities';
COMMENT ON COLUMN giperarena.audit_logs.action IS 'Action performed (created, updated, deleted, login, logout, etc.)';
COMMENT ON COLUMN giperarena.audit_logs.changes IS 'JSON with field-level changes (what changed)';
COMMENT ON COLUMN giperarena.audit_logs.old_values IS 'Previous state of the entity';
COMMENT ON COLUMN giperarena.audit_logs.new_values IS 'New state of the entity';
COMMENT ON COLUMN giperarena.audit_logs.request_id IS 'Request ID for tracing related actions';
COMMENT ON COLUMN giperarena.audit_logs.duration_ms IS 'Time taken to perform the action (in milliseconds)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_audit_wallets ON giperarena.wallets;
DROP TRIGGER IF EXISTS trigger_audit_transactions ON giperarena.transactions;
DROP FUNCTION IF EXISTS giperarena.log_audit_event(UUID, VARCHAR, VARCHAR, UUID, JSONB, JSONB, JSONB, INET, TEXT, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS giperarena.get_user_activity(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS giperarena.get_entity_history(VARCHAR, UUID, INTEGER);
DROP FUNCTION IF EXISTS giperarena.detect_suspicious_activity(UUID, INTEGER);
DROP FUNCTION IF EXISTS giperarena.auto_audit_sensitive_changes();
DROP TABLE IF EXISTS giperarena.audit_logs CASCADE;
-- +goose StatementEnd
