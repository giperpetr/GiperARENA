-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS giperarena.arena_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID NOT NULL REFERENCES giperarena.arenas(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    device_id UUID REFERENCES giperarena.devices(id) ON DELETE SET NULL,
    price_modifier DECIMAL(5, 2) DEFAULT 1.00 CHECK (price_modifier > 0),
    max_sessions_per_hour INTEGER DEFAULT 4 CHECK (max_sessions_per_hour > 0),
    is_active BOOLEAN DEFAULT true,
    special_event VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Indexes
CREATE INDEX idx_arena_schedules_arena_id ON giperarena.arena_schedules(arena_id);
CREATE INDEX idx_arena_schedules_day_of_week ON giperarena.arena_schedules(day_of_week);
CREATE INDEX idx_arena_schedules_device_id ON giperarena.arena_schedules(device_id) WHERE device_id IS NOT NULL;
CREATE INDEX idx_arena_schedules_is_active ON giperarena.arena_schedules(is_active) WHERE is_active = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_arena_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_arena_schedules_updated_at
    BEFORE UPDATE ON giperarena.arena_schedules
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_arena_schedule_updated_at();

-- Function to check if arena is open at specific time
CREATE OR REPLACE FUNCTION giperarena.is_arena_open(
    p_arena_id UUID,
    p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
    v_day_of_week INTEGER;
    v_time_of_day TIME;
    v_is_open BOOLEAN;
BEGIN
    v_day_of_week := EXTRACT(DOW FROM p_check_time);
    v_time_of_day := p_check_time::TIME;

    SELECT EXISTS (
        SELECT 1
        FROM giperarena.arena_schedules
        WHERE arena_id = p_arena_id
        AND day_of_week = v_day_of_week
        AND start_time <= v_time_of_day
        AND end_time >= v_time_of_day
        AND is_active = true
    ) INTO v_is_open;

    RETURN v_is_open;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE giperarena.arena_schedules IS 'Working hours and availability schedule for arenas and devices';
COMMENT ON COLUMN giperarena.arena_schedules.day_of_week IS '0 = Sunday, 1 = Monday, ..., 6 = Saturday';
COMMENT ON COLUMN giperarena.arena_schedules.price_modifier IS 'Price multiplier for this time slot (e.g., 1.5 for peak hours)';
COMMENT ON COLUMN giperarena.arena_schedules.max_sessions_per_hour IS 'Maximum number of game sessions per hour in this slot';
COMMENT ON COLUMN giperarena.arena_schedules.special_event IS 'Name of special event (tournament, maintenance, etc.)';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_arena_schedules_updated_at ON giperarena.arena_schedules;
DROP FUNCTION IF EXISTS giperarena.update_arena_schedule_updated_at();
DROP FUNCTION IF EXISTS giperarena.is_arena_open(UUID, TIMESTAMPTZ);
DROP TABLE IF EXISTS giperarena.arena_schedules CASCADE;
-- +goose StatementEnd
