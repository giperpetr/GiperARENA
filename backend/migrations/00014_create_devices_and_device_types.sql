-- +goose Up
-- +goose StatementBegin
-- Create device_types table (lookup table)
CREATE TABLE IF NOT EXISTS giperarena.device_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'robot', 'drone', 'crawler', 'vehicle', 'other'
    )),
    description TEXT,
    icon_url TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create devices table
CREATE TABLE IF NOT EXISTS giperarena.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID NOT NULL REFERENCES giperarena.arenas(id) ON DELETE CASCADE,
    device_type_id UUID NOT NULL REFERENCES giperarena.device_types(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN (
        'online', 'offline', 'in_use', 'maintenance', 'broken'
    )),
    raspberry_pi_id VARCHAR(100) UNIQUE,
    ip_address INET,
    firmware_version VARCHAR(20),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    last_heartbeat TIMESTAMPTZ,
    capabilities JSONB DEFAULT '{}'::jsonb,
    maintenance_schedule JSONB DEFAULT '{}'::jsonb,
    total_sessions INTEGER DEFAULT 0,
    total_uptime_hours DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for device_types
CREATE INDEX idx_device_types_category ON giperarena.device_types(category);
CREATE INDEX idx_device_types_name ON giperarena.device_types(name);

-- Indexes for devices
CREATE INDEX idx_devices_arena_id ON giperarena.devices(arena_id);
CREATE INDEX idx_devices_device_type_id ON giperarena.devices(device_type_id);
CREATE INDEX idx_devices_status ON giperarena.devices(status) WHERE status != 'offline';
CREATE INDEX idx_devices_raspberry_pi_id ON giperarena.devices(raspberry_pi_id) WHERE raspberry_pi_id IS NOT NULL;
CREATE INDEX idx_devices_serial_number ON giperarena.devices(serial_number);
CREATE INDEX idx_devices_last_heartbeat ON giperarena.devices(last_heartbeat DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION giperarena.update_device_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_devices_updated_at
    BEFORE UPDATE ON giperarena.devices
    FOR EACH ROW
    EXECUTE FUNCTION giperarena.update_device_updated_at();

-- Function to update device heartbeat
CREATE OR REPLACE FUNCTION giperarena.update_device_heartbeat(device_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE giperarena.devices
    SET last_heartbeat = NOW(),
        status = CASE
            WHEN status = 'offline' THEN 'online'
            ELSE status
        END
    WHERE id = device_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE giperarena.device_types IS 'Catalog of device types (robots, drones, crawlers, etc.)';
COMMENT ON TABLE giperarena.devices IS 'Physical devices (robots, drones) in arenas connected via Raspberry Pi';
COMMENT ON COLUMN giperarena.devices.raspberry_pi_id IS 'Unique identifier of controlling Raspberry Pi';
COMMENT ON COLUMN giperarena.devices.capabilities IS 'JSON with device capabilities (camera, sensors, weapons, etc.)';
COMMENT ON COLUMN giperarena.devices.maintenance_schedule IS 'JSON with maintenance schedule and history';
COMMENT ON COLUMN giperarena.devices.battery_level IS 'Current battery level (0-100%)';
COMMENT ON COLUMN giperarena.devices.last_heartbeat IS 'Last time device sent heartbeat signal';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trigger_devices_updated_at ON giperarena.devices;
DROP FUNCTION IF EXISTS giperarena.update_device_updated_at();
DROP FUNCTION IF EXISTS giperarena.update_device_heartbeat(UUID);
DROP TABLE IF EXISTS giperarena.devices CASCADE;
DROP TABLE IF EXISTS giperarena.device_types CASCADE;
-- +goose StatementEnd
