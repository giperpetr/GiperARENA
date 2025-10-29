-- Simplified Seed Data for GiperARENA Database
-- This script provides minimal test data for development
--
-- Usage:
--   psql -h localhost -U postgres -d giperarena -f seed_simple.sql

-- Disable triggers to avoid issues with missing columns in achievement trigger
SET session_replication_role = replica;

-- Set search path for PostGIS functions
SET search_path TO giperarena, public;

BEGIN;

-- =============================================================================
-- USERS (10 records)
-- =============================================================================
INSERT INTO users (id, username, email, wallet_address, avatar_url, is_verified, is_active, metadata)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@giperarena.com', NULL, NULL, true, true,
   '{"bio": "GiperARENA Administrator", "role": "admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'caedrel', 'caedrel@giperarena.com', '8KqFJPZs9xGKxKqwDxKg7xH5cGvYzXqYzR8KqFJPZs9x', 'https://static-cdn.jtvnw.net/jtv_user_pictures/caedrel.jpg', true, true,
   '{"bio": "Professional robot racer from UK", "country": "UK", "twitch": "caedrel"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'summit1g', 'summit@giperarena.com', '9LrGKQAt0yHLyLrxEyLh8yI6dHwZaYrZaS9LrGKQAt0y', 'https://static-cdn.jtvnw.net/jtv_user_pictures/summit1g.jpg', true, true,
   '{"bio": "Claw game master and variety streamer", "country": "USA", "twitch": "summit1g"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'xqcow', 'xqc@giperarena.com', 'AMsHRBu1zIMyMsyFzMi9zJ7eIxAbZsAbT0AMsHRBu1z', 'https://static-cdn.jtvnw.net/jtv_user_pictures/xqcow.jpg', true, true,
   '{"bio": "JUICE! Combat bot enthusiast", "country": "Canada", "twitch": "xqcow"}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', 'pokimane', 'poki@giperarena.com', 'BNtISCv2aJNzNtzGaMj0aK8fJyBcAtBcU1BNtISCv2a', 'https://static-cdn.jtvnw.net/jtv_user_pictures/pokimane.jpg', true, true,
   '{"bio": "Drone racing champion", "country": "Canada", "twitch": "pokimane"}'::jsonb),
  ('00000000-0000-0000-0000-000000000006', 'shroud', 'shroud@giperarena.com', 'COuJTDw3bKOaOu0HbNk1bL9gKzCdBuCdV2COuJTDw3b', 'https://static-cdn.jtvnw.net/jtv_user_pictures/shroud.jpg', true, true,
   '{"bio": "Precision control specialist", "country": "Canada", "twitch": "shroud"}'::jsonb),
  ('00000000-0000-0000-0000-000000000007', 'tfue', 'tfue@giperarena.com', 'DPvKUEx4cLPbPv1IcOl2cM0hL0DeCvDeW3DPvKUEx4c', 'https://static-cdn.jtvnw.net/jtv_user_pictures/tfue.jpg', true, true,
   '{"bio": "Aggressive racer, tournament grinder", "country": "USA", "twitch": "tfue"}'::jsonb),
  ('00000000-0000-0000-0000-000000000008', 'ninja', 'ninja@giperarena.com', 'EQwLVFy5dMQcQw2JdPm3dN1iM1EfDwEfX4EQwLVFy5d', 'https://static-cdn.jtvnw.net/jtv_user_pictures/ninja.jpg', true, true,
   '{"bio": "Fast reflexes, faster robots", "country": "USA", "twitch": "ninja"}'::jsonb),
  ('00000000-0000-0000-0000-000000000009', 'drdisrespect', 'doc@giperarena.com', 'FRxMWGz6eNRdRx3KeQn4eO2jN2FgExFgY5FRxMWGz6e', 'https://static-cdn.jtvnw.net/jtv_user_pictures/drdisrespect.jpg', true, true,
   '{"bio": "Two-time champion of the arena", "country": "USA", "twitch": "drdisrespect"}'::jsonb),
  ('00000000-0000-0000-0000-000000000010', 'sykkuno', 'sykkuno@giperarena.com', 'GSyNXH07fOSeS04LfRo5fP3kO3GhFyGhZ6GSyNXH07f', 'https://static-cdn.jtvnw.net/jtv_user_pictures/sykkuno.jpg', true, true,
   '{"bio": "I just play for fun", "country": "USA", "twitch": "sykkuno"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WALLETS (10 records - one per user)
-- =============================================================================
INSERT INTO wallets (id, user_id, gac_balance, pac_balance, staked_gac, staking_tier, total_earned, total_spent)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1000000, 500000, 0, 'none', 0, 0),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 5000, 10000, 1500, 'bronze', 25000, 15000),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 12000, 8500, 11000, 'silver', 45000, 33000),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 3200, 6700, 800, 'bronze', 18000, 11300),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 8900, 12300, 0, 'none', 32000, 19100),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 55000, 22000, 52000, 'gold', 180000, 125000),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 7800, 9200, 2500, 'bronze', 28000, 18200),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 15000, 18000, 12000, 'silver', 65000, 47000),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', 9500, 11000, 3000, 'bronze', 38000, 27000),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 4200, 5800, 0, 'none', 15000, 9200)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ARENAS (5 records)
-- =============================================================================
INSERT INTO arenas (id, name, description, operator_id, location_address, location_coordinates, status, arena_type, price_per_minute, currency, max_players, rating, total_games, is_verified, metadata)
VALUES
  ('20000000-0000-0000-0000-000000000001',
   'Moscow Battle Arena',
   'Premier indoor combat arena with obstacle courses and weapon systems. Features multiple camera angles and professional lighting.',
   '00000000-0000-0000-0000-000000000001',
   'Moscow, Russia',
   ST_GeogFromText('POINT(37.6173 55.7558)'),
   'active',
   'combat',
   25.00,
   'PAC',
   2,
   4.8,
   1250,
   true,
   '{"capacity": 50, "features": ["obstacles", "weapons", "night_vision"]}'::jsonb),

  ('20000000-0000-0000-0000-000000000002',
   'London Drone Circuit',
   'High-speed drone racing track with automated timing and FPV camera systems.',
   '00000000-0000-0000-0000-000000000002',
   'London, UK',
   ST_GeogFromText('POINT(-0.1276 51.5074)'),
   'active',
   'racing',
   18.00,
   'PAC',
   4,
   4.6,
   890,
   true,
   '{"capacity": 100, "features": ["fpv_cameras", "timing_gates", "led_track"]}'::jsonb),

  ('20000000-0000-0000-0000-000000000003',
   'Tokyo Robot Arena',
   'Multi-purpose arena supporting combat, racing, and puzzle challenges.',
   '00000000-0000-0000-0000-000000000003',
   'Tokyo, Japan',
   ST_GeogFromText('POINT(139.6917 35.6895)'),
   'active',
   'multipurpose',
   30.00,
   'PAC',
   3,
   4.9,
   2100,
   true,
   '{"capacity": 75, "features": ["modular_course", "4k_cameras", "haptic_feedback"]}'::jsonb),

  ('20000000-0000-0000-0000-000000000004',
   'California Test Facility',
   'New arena under construction with state-of-the-art equipment.',
   '00000000-0000-0000-0000-000000000001',
   'Los Angeles, USA',
   ST_GeogFromText('POINT(-118.2437 34.0522)'),
   'maintenance',
   'testing',
   15.00,
   'PAC',
   1,
   0.0,
   0,
   false,
   '{"capacity": 20, "features": ["prototype_devices"]}'::jsonb),

  ('20000000-0000-0000-0000-000000000005',
   'Berlin Underground',
   'Underground crawler arena with complex tunnel systems.',
   '00000000-0000-0000-0000-000000000004',
   'Berlin, Germany',
   ST_GeogFromText('POINT(13.4050 52.5200)'),
   'active',
   'crawler',
   22.00,
   'PAC',
   2,
   4.7,
   680,
   true,
   '{"capacity": 40, "features": ["tunnel_system", "infrared_cameras", "underground"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEVICE TYPES (5 records)
-- =============================================================================
INSERT INTO device_types (id, name, category, description, icon_url, specifications)
VALUES
  ('30000000-0000-0000-0000-000000000001',
   'Combat Bot MK-1',
   'robot',
   'Standard combat robot with basic weapons and armor',
   '/icons/combat-bot.svg',
   '{"weight_kg": 15, "max_speed_kmh": 8, "weapons": ["flipper", "spinner"], "armor": "steel"}'::jsonb),

  ('30000000-0000-0000-0000-000000000002',
   'Racing Drone X3',
   'drone',
   'High-speed FPV racing drone with HD camera',
   '/icons/racing-drone.svg',
   '{"weight_g": 250, "max_speed_kmh": 140, "camera": "1080p_60fps", "flight_time_min": 8}'::jsonb),

  ('30000000-0000-0000-0000-000000000003',
   'Crawler Tank',
   'crawler',
   'All-terrain tracked vehicle for exploration',
   '/icons/crawler.svg',
   '{"weight_kg": 20, "max_speed_kmh": 5, "camera": "4k_30fps", "sensors": ["lidar", "ultrasonic"]}'::jsonb),

  ('30000000-0000-0000-0000-000000000004',
   'RC Car Turbo',
   'vehicle',
   'Fast RC car for racing challenges',
   '/icons/rc-car.svg',
   '{"weight_kg": 5, "max_speed_kmh": 60, "camera": "720p_30fps", "drive": "4wd"}'::jsonb),

  ('30000000-0000-0000-0000-000000000005',
   'Sumo Bot',
   'robot',
   'Heavy pushing bot for sumo competitions',
   '/icons/sumo-bot.svg',
   '{"weight_kg": 25, "max_speed_kmh": 6, "weapons": ["pusher"], "traction": "high"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEVICES (10 records)
-- =============================================================================
INSERT INTO devices (id, arena_id, device_type_id, name, serial_number, status, raspberry_pi_id, firmware_version, battery_level, capabilities, total_sessions, is_active)
VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Combat Bot Alpha', 'CB-001-MSK', 'online', 'RPI-MSK-001', 'v2.4.1', 85, '{"cameras": 2, "weapons": true, "armor": "medium"}'::jsonb, 450, true),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Combat Bot Beta', 'CB-002-MSK', 'online', 'RPI-MSK-002', 'v2.4.1', 92, '{"cameras": 2, "weapons": true, "armor": "medium"}'::jsonb, 420, true),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Drone Racer 1', 'DR-001-LON', 'online', 'RPI-LON-001', 'v3.1.0', 78, '{"cameras": 1, "fpv": true, "telemetry": true}'::jsonb, 680, true),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Drone Racer 2', 'DR-002-LON', 'maintenance', 'RPI-LON-002', 'v3.1.0', 45, '{"cameras": 1, "fpv": true, "telemetry": true}'::jsonb, 520, true),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Tokyo Bot Red', 'CB-003-TKY', 'online', 'RPI-TKY-001', 'v2.5.0', 100, '{"cameras": 3, "weapons": true, "armor": "heavy"}'::jsonb, 890, true),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Tokyo Bot Blue', 'CB-004-TKY', 'online', 'RPI-TKY-002', 'v2.5.0', 88, '{"cameras": 3, "weapons": true, "armor": "heavy"}'::jsonb, 850, true),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Test Car Proto', 'RC-001-LAX', 'offline', 'RPI-LAX-001', 'v1.0.0', 0, '{"cameras": 1, "testing": true}'::jsonb, 0, true),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Crawler Berlin 1', 'CR-001-BER', 'online', 'RPI-BER-001', 'v2.2.3', 70, '{"cameras": 2, "night_vision": true, "lidar": true}'::jsonb, 320, true),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Crawler Berlin 2', 'CR-002-BER', 'online', 'RPI-BER-002', 'v2.2.3', 65, '{"cameras": 2, "night_vision": true, "lidar": true}'::jsonb, 280, true),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'Sumo Moscow', 'SB-001-MSK', 'online', 'RPI-MSK-003', 'v2.1.0', 95, '{"cameras": 1, "weight": "heavy", "pushing_force": "high"}'::jsonb, 210, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- TOURNAMENTS (5 records)
-- =============================================================================
INSERT INTO tournaments (id, name, description, organizer_id, arena_id, tournament_type, status, entry_fee, prize_pool, max_participants, current_participants, start_date, rules)
VALUES
  ('50000000-0000-0000-0000-000000000001',
   'Moscow Combat Championship 2025',
   'Annual combat robot championship with 64 participants',
   '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'single_elimination',
   'completed',
   100.00,
   5000.00,
   64,
   64,
   NOW() - INTERVAL '30 days',
   '{"rounds": 6, "time_limit_sec": 180, "ko_rules": true}'::jsonb),

  ('50000000-0000-0000-0000-000000000002',
   'London Drone Grand Prix',
   'High-speed drone racing tournament',
   '00000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000002',
   'swiss',
   'in_progress',
   50.00,
   2500.00,
   32,
   28,
   NOW() - INTERVAL '2 days',
   '{"laps": 5, "qualification": true, "time_trial": true}'::jsonb),

  ('50000000-0000-0000-0000-000000000003',
   'Weekly Beginner Series',
   'Small tournament for new players',
   '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003',
   'round_robin',
   'registration',
   10.00,
   200.00,
   16,
   12,
   NOW() + INTERVAL '7 days',
   '{"games_per_match": 3, "beginner_only": true}'::jsonb),

  ('50000000-0000-0000-0000-000000000004',
   'Berlin Underground Challenge',
   'Crawler navigation and speed competition',
   '00000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000005',
   'double_elimination',
   'upcoming',
   75.00,
   1500.00,
   24,
   0,
   NOW() + INTERVAL '21 days',
   '{"checkpoint_race": true, "navigation_required": true}'::jsonb),

  ('50000000-0000-0000-0000-000000000005',
   'International Arena Masters',
   'Invite-only championship for top players',
   '00000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003',
   'single_elimination',
   'upcoming',
   500.00,
   25000.00,
   16,
   8,
   NOW() + INTERVAL '60 days',
   '{"invite_only": true, "min_rating": 4.5, "multi_arena": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- GAME SESSIONS (10 records)
-- =============================================================================
INSERT INTO game_sessions (id, arena_id, player_id, status, game_mode, start_time, end_time, duration_seconds, score, entry_fee, control_latency_ms, metadata)
VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'completed', 'combat_1v1', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 57 minutes', 180, 1250, 25.00, 85, '{"opponent": "AI_Bot_Medium", "winner": true}'::jsonb),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'completed', 'combat_1v1', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 57 minutes', 180, 980, 25.00, 92, '{"opponent": "AI_Bot_Hard", "winner": false}'::jsonb),
  ('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'completed', 'time_trial', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 55 minutes', 300, 2840, 18.00, 65, '{"laps": 5, "best_lap_sec": 54.2}'::jsonb),
  ('60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'completed', 'time_trial', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 55 minutes', 300, 3120, 18.00, 58, '{"laps": 5, "best_lap_sec": 49.8}'::jsonb),
  ('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'completed', 'obstacle_course', NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '80 minutes', 600, 4500, 30.00, 45, '{"checkpoints": 12, "perfect_run": true}'::jsonb),
  ('60000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'completed', 'exploration', NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '50 minutes', 600, 1850, 22.00, 105, '{"area_explored_pct": 78, "collectibles": 15}'::jsonb),
  ('60000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'in_progress', 'combat_1v1', NOW() - INTERVAL '5 minutes', NULL, NULL, 450, 25.00, 78, '{"opponent": "00000000-0000-0000-0000-000000000010"}'::jsonb),
  ('60000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'waiting', 'time_trial', NOW() + INTERVAL '10 minutes', NULL, NULL, 0, 18.00, NULL, '{"scheduled": true}'::jsonb),
  ('60000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'completed', 'puzzle_challenge', NOW() - INTERVAL '24 hours', NOW() - INTERVAL '23 hours 40 minutes', 1200, 3200, 30.00, 72, '{"puzzles_solved": 8, "hints_used": 2}'::jsonb),
  ('60000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'cancelled', 'exploration', NOW() - INTERVAL '12 hours', NULL, NULL, 0, 22.00, NULL, '{"reason": "device_malfunction"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ACHIEVEMENTS (10 records) - SKIPPED (already seeded in previous run)
-- =============================================================================
-- Achievements already exist: Speed Demon, Combat Master, First Blood, etc.

COMMIT;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- Records inserted (if all successful):
--   - Users: 10
--   - Wallets: 10
--   - Arenas: 5
--   - Device Types: 5
--   - Devices: 10
--   - Tournaments: 5
--   - Game Sessions: 10
--   - Achievements: 10
--   TOTAL: 65 records

-- Verification queries:
-- SELECT 'users' as table_name, COUNT(*) as count FROM giperarena.users
-- UNION ALL SELECT 'wallets', COUNT(*) FROM giperarena.wallets
-- UNION ALL SELECT 'arenas', COUNT(*) FROM giperarena.arenas
-- UNION ALL SELECT 'device_types', COUNT(*) FROM giperarena.device_types
-- UNION ALL SELECT 'devices', COUNT(*) FROM giperarena.devices
-- UNION ALL SELECT 'tournaments', COUNT(*) FROM giperarena.tournaments
-- UNION ALL SELECT 'game_sessions', COUNT(*) FROM giperarena.game_sessions
-- UNION ALL SELECT 'achievements', COUNT(*) FROM giperarena.achievements;
