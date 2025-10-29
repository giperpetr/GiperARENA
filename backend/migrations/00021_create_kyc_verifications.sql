-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES giperarena.users(id) ON DELETE CASCADE,
    verification_level VARCHAR(20) DEFAULT 'none' CHECK (verification_level IN (
        'none', 'email', 'phone', 'basic', 'full'
    )),
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    email_verification_token VARCHAR(100),
    email_verification_expires_at TIMESTAMPTZ,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    phone_verification_code VARCHAR(10),
    phone_verification_expires_at TIMESTAMPTZ,
    full_name VARCHAR(200),
    date_of_birth DATE,
    country_code VARCHAR(2),
    document_type VARCHAR(30) CHECK (document_type IN (
        'passport', 'drivers_license', 'national_id', 'residence_permit'
    )),
    document_number VARCHAR(100),
    document_front_url TEXT,
    document_back_url TEXT,
    selfie_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'in_review', 'approved', 'rejected', 'expired'
    )),
    rejection_reason TEXT,
    verified_by UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for KYC verification attempts/history
CREATE TABLE IF NOT EXISTS giperarena.kyc_verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_id UUID NOT NULL REFERENCES giperarena.kyc_verifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'submitted', 'approved', 'rejected', 'expired', 'resubmitted', 'document_uploaded'
    )),
    performed_by UUID REFERENCES giperarena.users(id) ON DELETE SET NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for kyc_verifications
CREATE INDEX idx_kyc_verifications_user_id ON giperarena.kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_verification_level ON giperarena.kyc_verifications(verification_level);
CREATE INDEX idx_kyc_verifications_verification_status ON giperarena.kyc_verifications(verification_status);
CREATE INDEX idx_kyc_verifications_email_verified ON giperarena.kyc_verifications(email_verified);
CREATE INDEX idx_kyc_verifications_phone_verified ON giperarena.kyc_verifications(phone_verified);
CREATE INDEX idx_kyc_verifications_expires_at ON giperarena.kyc_verifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_kyc_verifications_created_at ON giperarena.kyc_verifications(created_at DESC);

-- Indexes for kyc_verification_history
CREATE INDEX idx_kyc_verification_history_kyc_id ON giperarena.kyc_verification_history(kyc_id);
CREATE INDEX idx_kyc_verification_history_user_id ON giperarena.kyc_verification_history(user_id);
CREATE INDEX idx_kyc_verification_history_action ON giperarena.kyc_verification_history(action);
CREATE INDEX idx_kyc_verification_history_created_at ON giperarena.kyc_verification_history(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kyc_verifications_updated_at
    BEFORE UPDATE ON giperarena.kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_kyc_updated_at();

-- Trigger to log KYC changes
CREATE OR REPLACE FUNCTION giperarena.log_kyc_change()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(50);
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'submitted';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.verification_status != NEW.verification_status THEN
            IF NEW.verification_status = 'approved' THEN
                v_action := 'approved';
            ELSIF NEW.verification_status = 'rejected' THEN
                v_action := 'rejected';
            ELSIF NEW.verification_status = 'expired' THEN
                v_action := 'expired';
            ELSIF OLD.verification_status = 'rejected' AND NEW.verification_status = 'pending' THEN
                v_action := 'resubmitted';
            END IF;
        ELSIF (OLD.document_front_url IS NULL AND NEW.document_front_url IS NOT NULL)
           OR (OLD.document_back_url IS NULL AND NEW.document_back_url IS NOT NULL)
           OR (OLD.selfie_url IS NULL AND NEW.selfie_url IS NOT NULL) THEN
            v_action := 'document_uploaded';
        END IF;
    END IF;

    IF v_action IS NOT NULL THEN
        INSERT INTO giperarena.kyc_verification_history (
            kyc_id,
            user_id,
            action,
            performed_by,
            old_status,
            new_status,
            ip_address
        ) VALUES (
            NEW.id,
            NEW.user_id,
            v_action,
            NEW.verified_by,
            OLD.verification_status,
            NEW.verification_status,
            NEW.ip_address
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_kyc_change
    AFTER INSERT OR UPDATE ON giperarena.kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.log_kyc_change();

-- Trigger to update user verification status
CREATE OR REPLACE FUNCTION giperarena.update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status = 'approved' THEN
        UPDATE giperarena.users
        SET is_verified = true
        WHERE id = NEW.user_id;
    ELSIF NEW.verification_status IN ('rejected', 'expired') AND OLD.verification_status = 'approved' THEN
        UPDATE giperarena.users
        SET is_verified = false
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_verification_status
    AFTER UPDATE ON giperarena.kyc_verifications
    FOR EACH ROW
    WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
    EXECUTE FUNCTION giperarena.update_user_verification_status();

-- Function to check if email verification is expired
CREATE OR REPLACE FUNCTION giperarena.is_email_verification_valid(p_user_id UUID, p_token VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM giperarena.kyc_verifications
        WHERE user_id = p_user_id
        AND email_verification_token = p_token
        AND email_verification_expires_at > NOW()
        AND email_verified = false
    ) INTO v_is_valid;

    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql;

-- Function to verify email
CREATE OR REPLACE FUNCTION giperarena.verify_email(p_user_id UUID, p_token VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE giperarena.kyc_verifications
    SET email_verified = true,
        email_verified_at = NOW(),
        email_verification_token = NULL,
        email_verification_expires_at = NULL,
        verification_level = 'email'
    WHERE user_id = p_user_id
    AND email_verification_token = p_token
    AND email_verification_expires_at > NOW()
    AND email_verified = false;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate new email verification token
CREATE OR REPLACE FUNCTION giperarena.generate_email_verification_token(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_token VARCHAR(100);
BEGIN
    v_token := encode(gen_random_bytes(32), 'hex');

    UPDATE giperarena.kyc_verifications
    SET email_verification_token = v_token,
        email_verification_expires_at = NOW() + INTERVAL '24 hours'
    WHERE user_id = p_user_id;

    -- Insert into history if record exists, create if not
    INSERT INTO giperarena.kyc_verifications (user_id, email_verification_token, email_verification_expires_at)
    VALUES (p_user_id, v_token, NOW() + INTERVAL '24 hours')
    ON CONFLICT (user_id) DO UPDATE
    SET email_verification_token = v_token,
        email_verification_expires_at = NOW() + INTERVAL '24 hours';

    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE giperarena.kyc_verifications IS 'KYC (Know Your Customer) verification data for users';
COMMENT ON TABLE giperarena.kyc_verification_history IS 'Audit log of all KYC verification changes';
COMMENT ON COLUMN giperarena.kyc_verifications.verification_level IS 'none -> email -> phone -> basic -> full';
COMMENT ON COLUMN giperarena.kyc_verifications.email_verified IS 'Email verification via token sent to email';
COMMENT ON COLUMN giperarena.kyc_verifications.phone_verified IS 'Phone verification via SMS code (future feature)';
COMMENT ON COLUMN giperarena.kyc_verifications.document_front_url IS 'URL to front side of ID document in MinIO';
COMMENT ON COLUMN giperarena.kyc_verifications.document_back_url IS 'URL to back side of ID document in MinIO';
COMMENT ON COLUMN giperarena.kyc_verifications.selfie_url IS 'URL to selfie photo for face matching (future)';
COMMENT ON COLUMN giperarena.kyc_verifications.expires_at IS 'When full KYC verification expires (annual renewal)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_kyc_verifications_updated_at ON giperarena.kyc_verifications;
DROP TRIGGER IF EXISTS trigger_log_kyc_change ON giperarena.kyc_verifications;
DROP TRIGGER IF EXISTS trigger_update_user_verification_status ON giperarena.kyc_verifications;
DROP FUNCTION IF EXISTS giperarena.update_kyc_updated_at();
DROP FUNCTION IF EXISTS giperarena.log_kyc_change();
DROP FUNCTION IF EXISTS giperarena.update_user_verification_status();
DROP FUNCTION IF EXISTS giperarena.is_email_verification_valid(UUID, VARCHAR);
DROP FUNCTION IF EXISTS giperarena.verify_email(UUID, VARCHAR);
DROP FUNCTION IF EXISTS giperarena.generate_email_verification_token(UUID);
DROP TABLE IF EXISTS giperarena.kyc_verification_history CASCADE;
DROP TABLE IF EXISTS giperarena.kyc_verifications CASCADE;
-- +goose StatementEnd
