-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    value_type VARCHAR(20) NOT NULL CHECK (value_type IN (
        'string', 'number', 'boolean', 'json', 'array'
    )),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'general', 'gaming', 'payment', 'security', 'notification',
        'tournament', 'blockchain', 'email', 'sms', 'feature_flags'
    )),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    validation_schema JSONB,
    default_value JSONB,
    updated_by UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for system feature flags
CREATE TABLE IF NOT EXISTS giperarena.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    description TEXT,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    user_whitelist UUID[] DEFAULT '{}',
    user_blacklist UUID[] DEFAULT '{}',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for system_settings
CREATE INDEX idx_system_settings_key ON giperarena.system_settings(key);
CREATE INDEX idx_system_settings_category ON giperarena.system_settings(category);
CREATE INDEX idx_system_settings_is_public ON giperarena.system_settings(is_public) WHERE is_public = true;
CREATE INDEX idx_system_settings_updated_at ON giperarena.system_settings(updated_at DESC);

-- Indexes for feature_flags
CREATE INDEX idx_feature_flags_key ON giperarena.feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON giperarena.feature_flags(enabled) WHERE enabled = true;
CREATE INDEX idx_feature_flags_start_date ON giperarena.feature_flags(start_date) WHERE start_date IS NOT NULL;
CREATE INDEX idx_feature_flags_end_date ON giperarena.feature_flags(end_date) WHERE end_date IS NOT NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_system_settings_updated_at
    BEFORE UPDATE ON giperarena.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_system_settings_updated_at();

CREATE TRIGGER trigger_feature_flags_updated_at
    BEFORE UPDATE ON giperarena.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_system_settings_updated_at();

-- Function to get setting value
CREATE OR REPLACE FUNCTION giperarena.get_setting(p_key VARCHAR, p_default JSONB DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_value JSONB;
BEGIN
    SELECT value INTO v_value
    FROM giperarena.system_settings
    WHERE key = p_key;

    RETURN COALESCE(v_value, p_default);
END;
$$ LANGUAGE plpgsql;

-- Function to set setting value
CREATE OR REPLACE FUNCTION giperarena.set_setting(
    p_key VARCHAR,
    p_value JSONB,
    p_updated_by UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO giperarena.system_settings (key, value, value_type, category, updated_by)
    VALUES (p_key, p_value, jsonb_typeof(p_value), 'general', p_updated_by)
    ON CONFLICT (key) DO UPDATE
    SET value = p_value,
        updated_by = p_updated_by,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if feature is enabled for user
CREATE OR REPLACE FUNCTION giperarena.is_feature_enabled(
    p_feature_key VARCHAR,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_flag RECORD;
    v_is_enabled BOOLEAN := false;
BEGIN
    SELECT * INTO v_flag
    FROM giperarena.feature_flags
    WHERE key = p_feature_key;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check if feature is globally disabled
    IF NOT v_flag.enabled THEN
        RETURN false;
    END IF;

    -- Check date range
    IF v_flag.start_date IS NOT NULL AND NOW() < v_flag.start_date THEN
        RETURN false;
    END IF;

    IF v_flag.end_date IS NOT NULL AND NOW() > v_flag.end_date THEN
        RETURN false;
    END IF;

    -- Check blacklist
    IF p_user_id IS NOT NULL AND p_user_id = ANY(v_flag.user_blacklist) THEN
        RETURN false;
    END IF;

    -- Check whitelist (bypasses percentage rollout)
    IF p_user_id IS NOT NULL AND p_user_id = ANY(v_flag.user_whitelist) THEN
        RETURN true;
    END IF;

    -- Check rollout percentage
    IF v_flag.rollout_percentage = 100 THEN
        RETURN true;
    ELSIF v_flag.rollout_percentage = 0 THEN
        RETURN false;
    ELSIF p_user_id IS NOT NULL THEN
        -- Deterministic rollout based on user ID hash
        RETURN (hashtext(p_user_id::TEXT) % 100) < v_flag.rollout_percentage;
    ELSE
        -- Random rollout for anonymous users
        RETURN (random() * 100) < v_flag.rollout_percentage;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default system settings
INSERT INTO giperarena.system_settings (key, value, value_type, category, description, is_public) VALUES
    ('platform.name', '"GiperARENA"', 'string', 'general', 'Platform name', true),
    ('platform.version', '"1.0.0"', 'string', 'general', 'Current platform version', true),
    ('platform.maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode', false),
    ('platform.maintenance_message', '"System maintenance in progress"', 'string', 'general', 'Maintenance mode message', true),

    ('gaming.min_session_duration_seconds', '60', 'number', 'gaming', 'Minimum game session duration', true),
    ('gaming.max_session_duration_seconds', '3600', 'number', 'gaming', 'Maximum game session duration', true),
    ('gaming.default_session_duration_seconds', '300', 'number', 'gaming', 'Default game session duration', true),
    ('gaming.session_price_per_minute', '0.5', 'number', 'gaming', 'Base price per minute in PAC', true),

    ('payment.pac_usd_rate', '1.00', 'number', 'payment', 'PAC to USD exchange rate (pegged)', true),
    ('payment.min_deposit_usd', '5.00', 'number', 'payment', 'Minimum deposit amount in USD', true),
    ('payment.max_deposit_usd', '10000.00', 'number', 'payment', 'Maximum deposit amount in USD', true),
    ('payment.min_withdrawal_pac', '10.00', 'number', 'payment', 'Minimum withdrawal amount in PAC', true),
    ('payment.withdrawal_fee_percentage', '2.5', 'number', 'payment', 'Withdrawal fee percentage', true),

    ('tournament.min_participants', '4', 'number', 'tournament', 'Minimum tournament participants', true),
    ('tournament.max_participants', '128', 'number', 'tournament', 'Maximum tournament participants', true),
    ('tournament.registration_deadline_hours', '2', 'number', 'tournament', 'Hours before tournament to close registration', true),

    ('security.max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before lockout', false),
    ('security.lockout_duration_minutes', '30', 'number', 'security', 'Account lockout duration in minutes', false),
    ('security.session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes', false),
    ('security.require_email_verification', 'true', 'boolean', 'security', 'Require email verification for new users', false),

    ('blockchain.gac_contract_address', '""', 'string', 'blockchain', 'GAC token contract address (Solana)', false),
    ('blockchain.min_gac_withdrawal', '1.0', 'number', 'blockchain', 'Minimum GAC withdrawal amount', true),
    ('blockchain.gac_withdrawal_fee', '0.1', 'number', 'blockchain', 'GAC withdrawal fee', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO giperarena.feature_flags (key, enabled, description, rollout_percentage) VALUES
    ('betting.enabled', false, 'Enable betting system', 0),
    ('tournaments.enabled', true, 'Enable tournament system', 100),
    ('nft.marketplace.enabled', false, 'Enable NFT marketplace', 0),
    ('chat.enabled', true, 'Enable chat system', 100),
    ('social.friends.enabled', true, 'Enable friend system', 100),
    ('achievements.enabled', true, 'Enable achievement system', 100),
    ('replays.enabled', true, 'Enable game replay recording', 100),
    ('wallet.gac.enabled', false, 'Enable GAC wallet integration', 0),
    ('payment.crypto.enabled', false, 'Enable crypto payments', 0),
    ('kyc.required', false, 'Require KYC for all users', 0),
    ('webrtc.enabled', true, 'Enable WebRTC device control', 100)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE giperarena.system_settings IS 'System-wide configuration settings';
COMMENT ON TABLE giperarena.feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON COLUMN giperarena.system_settings.is_public IS 'Whether setting is visible to non-admin users';
COMMENT ON COLUMN giperarena.system_settings.is_editable IS 'Whether setting can be changed via admin panel';
COMMENT ON COLUMN giperarena.system_settings.validation_schema IS 'JSON schema for value validation';
COMMENT ON COLUMN giperarena.feature_flags.rollout_percentage IS 'Percentage of users who see this feature (0-100)';
COMMENT ON COLUMN giperarena.feature_flags.user_whitelist IS 'User IDs who always have feature enabled';
COMMENT ON COLUMN giperarena.feature_flags.user_blacklist IS 'User IDs who never have feature enabled';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_system_settings_updated_at ON giperarena.system_settings;
DROP TRIGGER IF EXISTS trigger_feature_flags_updated_at ON giperarena.feature_flags;
DROP FUNCTION IF EXISTS giperarena.update_system_settings_updated_at();
DROP FUNCTION IF EXISTS giperarena.get_setting(VARCHAR, JSONB);
DROP FUNCTION IF EXISTS giperarena.set_setting(VARCHAR, JSONB, UUID);
DROP FUNCTION IF EXISTS giperarena.is_feature_enabled(VARCHAR, UUID);
DROP TABLE IF EXISTS giperarena.feature_flags CASCADE;
DROP TABLE IF EXISTS giperarena.system_settings CASCADE;
-- +goose StatementEnd
