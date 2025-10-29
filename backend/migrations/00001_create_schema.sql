-- +goose Up
-- +goose StatementBegin
-- Create giperarena schema
CREATE SCHEMA IF NOT EXISTS giperarena;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Set default search path for giperarena tenant
ALTER DATABASE postgres SET search_path TO giperarena, public;

COMMENT ON SCHEMA giperarena IS 'ArenaHUB application schema';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP SCHEMA IF EXISTS giperarena CASCADE;
-- +goose StatementEnd
