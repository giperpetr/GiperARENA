-- +goose Up
-- +goose StatementBegin
-- Create arenahub schema
CREATE SCHEMA IF NOT EXISTS arenahub;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Set default search path for arenahub tenant
ALTER DATABASE postgres SET search_path TO arenahub, public;

COMMENT ON SCHEMA arenahub IS 'ArenaHUB application schema';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP SCHEMA IF EXISTS arenahub CASCADE;
-- +goose StatementEnd
