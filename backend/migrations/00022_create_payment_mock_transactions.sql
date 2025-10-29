-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.payment_mock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES giperarena.transactions(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN (
        'credit_card', 'debit_card', 'paypal', 'crypto_btc', 'crypto_eth',
        'crypto_usdt', 'bank_transfer', 'google_pay', 'apple_pay'
    )),
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'USD',
    pac_amount DECIMAL(20, 2) NOT NULL CHECK (pac_amount > 0),
    exchange_rate DECIMAL(20, 8) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    )),
    mock_card_last4 VARCHAR(4),
    mock_card_brand VARCHAR(20),
    mock_paypal_email VARCHAR(255),
    mock_crypto_address VARCHAR(100),
    mock_crypto_txid VARCHAR(100),
    mock_bank_reference VARCHAR(50),
    failure_reason TEXT,
    should_fail BOOLEAN DEFAULT false,
    should_delay BOOLEAN DEFAULT false,
    delay_seconds INTEGER DEFAULT 0,
    processing_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for payment method details (stored for user convenience)
CREATE TABLE IF NOT EXISTS giperarena.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES giperarena.users(id) ON DELETE CASCADE,
    method_type VARCHAR(30) NOT NULL CHECK (method_type IN (
        'credit_card', 'debit_card', 'paypal', 'crypto_wallet', 'bank_account'
    )),
    is_default BOOLEAN DEFAULT false,
    nickname VARCHAR(100),
    mock_card_last4 VARCHAR(4),
    mock_card_brand VARCHAR(20),
    mock_card_exp_month INTEGER CHECK (mock_card_exp_month BETWEEN 1 AND 12),
    mock_card_exp_year INTEGER,
    mock_paypal_email VARCHAR(255),
    mock_crypto_wallet_address VARCHAR(100),
    mock_crypto_type VARCHAR(10),
    mock_bank_name VARCHAR(100),
    mock_bank_account_last4 VARCHAR(4),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_mock_transactions
CREATE INDEX idx_payment_mock_transactions_user_id ON giperarena.payment_mock_transactions(user_id);
CREATE INDEX idx_payment_mock_transactions_transaction_id ON giperarena.payment_mock_transactions(transaction_id);
CREATE INDEX idx_payment_mock_transactions_payment_method ON giperarena.payment_mock_transactions(payment_method);
CREATE INDEX idx_payment_mock_transactions_payment_status ON giperarena.payment_mock_transactions(payment_status);
CREATE INDEX idx_payment_mock_transactions_created_at ON giperarena.payment_mock_transactions(created_at DESC);
CREATE INDEX idx_payment_mock_transactions_completed_at ON giperarena.payment_mock_transactions(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Indexes for payment_methods
CREATE INDEX idx_payment_methods_user_id ON giperarena.payment_methods(user_id);
CREATE INDEX idx_payment_methods_method_type ON giperarena.payment_methods(method_type);
CREATE INDEX idx_payment_methods_is_default ON giperarena.payment_methods(is_default) WHERE is_default = true;
CREATE INDEX idx_payment_methods_is_active ON giperarena.payment_methods(is_active) WHERE is_active = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_payment_method_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON giperarena.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_payment_method_updated_at();

-- Trigger to ensure only one default payment method
CREATE OR REPLACE FUNCTION giperarena.ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE giperarena.payment_methods
        SET is_default = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_payment_method
    BEFORE INSERT OR UPDATE ON giperarena.payment_methods
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION giperarena.ensure_single_default_payment_method();

-- Function to simulate payment processing
CREATE OR REPLACE FUNCTION giperarena.process_mock_payment(p_payment_id UUID)
RETURNS void AS $$
DECLARE
    v_payment RECORD;
    v_should_succeed BOOLEAN;
    v_delay INTEGER;
BEGIN
    -- Get payment details
    SELECT * INTO v_payment
    FROM giperarena.payment_mock_transactions
    WHERE id = p_payment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;

    -- Update to processing
    UPDATE giperarena.payment_mock_transactions
    SET payment_status = 'processing',
        processing_started_at = NOW()
    WHERE id = p_payment_id;

    -- Simulate delay if requested
    IF v_payment.should_delay THEN
        PERFORM pg_sleep(LEAST(v_payment.delay_seconds, 5));
    END IF;

    -- Determine success/failure
    v_should_succeed := NOT v_payment.should_fail;

    -- Random 2% failure rate for realism
    IF v_should_succeed AND random() < 0.02 THEN
        v_should_succeed := false;
    END IF;

    IF v_should_succeed THEN
        -- Success: update payment and wallet
        UPDATE giperarena.payment_mock_transactions
        SET payment_status = 'completed',
            completed_at = NOW()
        WHERE id = p_payment_id;

        UPDATE giperarena.wallets
        SET pac_balance = pac_balance + v_payment.pac_amount
        WHERE user_id = v_payment.user_id;

        UPDATE giperarena.transactions
        SET status = 'completed'
        WHERE id = v_payment.transaction_id;

    ELSE
        -- Failure
        UPDATE giperarena.payment_mock_transactions
        SET payment_status = 'failed',
            failed_at = NOW(),
            failure_reason = COALESCE(
                v_payment.failure_reason,
                'Simulated payment failure'
            )
        WHERE id = p_payment_id;

        UPDATE giperarena.transactions
        SET status = 'failed'
        WHERE id = v_payment.transaction_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create mock deposit
CREATE OR REPLACE FUNCTION giperarena.create_mock_deposit(
    p_user_id UUID,
    p_amount DECIMAL,
    p_currency VARCHAR,
    p_payment_method VARCHAR,
    p_should_fail BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_payment_id UUID;
    v_pac_amount DECIMAL;
    v_exchange_rate DECIMAL := 1.00;
BEGIN
    -- Calculate PAC amount (1:1 with USD for mock)
    IF p_currency != 'USD' THEN
        -- Mock exchange rates
        CASE p_currency
            WHEN 'EUR' THEN v_exchange_rate := 1.10;
            WHEN 'GBP' THEN v_exchange_rate := 1.25;
            WHEN 'RUB' THEN v_exchange_rate := 0.011;
            ELSE v_exchange_rate := 1.00;
        END CASE;
    END IF;

    v_pac_amount := p_amount * v_exchange_rate;

    -- Create transaction record
    INSERT INTO giperarena.transactions (
        user_id,
        transaction_type,
        currency,
        amount,
        status,
        description
    ) VALUES (
        p_user_id,
        'deposit',
        'PAC',
        v_pac_amount,
        'pending',
        'PAC deposit via ' || p_payment_method
    ) RETURNING id INTO v_transaction_id;

    -- Create mock payment record
    INSERT INTO giperarena.payment_mock_transactions (
        user_id,
        transaction_id,
        payment_method,
        amount,
        currency,
        pac_amount,
        exchange_rate,
        should_fail
    ) VALUES (
        p_user_id,
        v_transaction_id,
        p_payment_method,
        p_amount,
        p_currency,
        v_pac_amount,
        v_exchange_rate,
        p_should_fail
    ) RETURNING id INTO v_payment_id;

    -- Process payment asynchronously (in real app, this would be background job)
    PERFORM giperarena.process_mock_payment(v_payment_id);

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE giperarena.payment_mock_transactions IS 'Mock payment transactions for testing deposit/withdrawal flows';
COMMENT ON TABLE giperarena.payment_methods IS 'Saved payment methods for user convenience (mock data)';
COMMENT ON COLUMN giperarena.payment_mock_transactions.should_fail IS 'For testing: force payment to fail';
COMMENT ON COLUMN giperarena.payment_mock_transactions.should_delay IS 'For testing: simulate slow payment processing';
COMMENT ON COLUMN giperarena.payment_mock_transactions.mock_card_last4 IS 'Mock credit card last 4 digits';
COMMENT ON COLUMN giperarena.payment_mock_transactions.mock_crypto_txid IS 'Mock blockchain transaction ID';
COMMENT ON COLUMN giperarena.payment_mock_transactions.exchange_rate IS 'Currency to PAC exchange rate at time of transaction';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON giperarena.payment_methods;
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON giperarena.payment_methods;
DROP FUNCTION IF EXISTS giperarena.update_payment_method_updated_at();
DROP FUNCTION IF EXISTS giperarena.ensure_single_default_payment_method();
DROP FUNCTION IF EXISTS giperarena.process_mock_payment(UUID);
DROP FUNCTION IF EXISTS giperarena.create_mock_deposit(UUID, DECIMAL, VARCHAR, VARCHAR, BOOLEAN);
DROP TABLE IF EXISTS giperarena.payment_methods CASCADE;
DROP TABLE IF EXISTS giperarena.payment_mock_transactions CASCADE;
-- +goose StatementEnd
