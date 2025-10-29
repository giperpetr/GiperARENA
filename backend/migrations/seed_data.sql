-- Seed data for GiperARENA
-- This script populates the database with realistic test data

-- Ensure we're using the correct schema
SET search_path TO giperarena;

-- ================================================
-- USERS (10 test users + admin)
-- ================================================
INSERT INTO users (id, username, email, wallet_address, avatar_url, bio, country, preferred_language, reputation_score, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@giperarena.space', '0x1234567890abcdef1234567890abcdef12345678', '/avatars/admin.jpg', 'System Administrator', 'USA', 'en', 1000, true),
  ('00000000-0000-0000-0000-000000000002', 'Caedrel', 'caedrel@example.com', '0x2234567890abcdef1234567890abcdef12345678', '👑', 'Professional robot racer from UK', 'UK', 'en', 950, true),
  ('00000000-0000-0000-0000-000000000003', 'summit1g', 'summit@example.com', '0x3234567890abcdef1234567890abcdef12345678', '⚡', 'Claw game master', 'USA', 'en', 920, true),
  ('00000000-0000-0000-0000-000000000004', 'xQc', 'xqc@example.com', '0x4234567890abcdef1234567890abcdef12345678', '🎮', 'Speed runner and drone pilot', 'Canada', 'en', 890, true),
  ('00000000-0000-0000-0000-000000000005', 'Pokimane', 'poki@example.com', '0x5234567890abcdef1234567890abcdef12345678', '🌟', 'Tournament champion', 'Canada', 'en', 910, true),
  ('00000000-0000-0000-0000-000000000006', 'Shroud', 'shroud@example.com', '0x6234567890abcdef1234567890abcdef12345678', '🎯', 'Precision drone racer', 'Canada', 'en', 940, true),
  ('00000000-0000-0000-0000-000000000007', 'Valkyrae', 'rae@example.com', '0x7234567890abcdef1234567890abcdef12345678', '👸', 'Robot combat specialist', 'USA', 'en', 870, true),
  ('00000000-0000-0000-0000-000000000008', 'Ludwig', 'ludwig@example.com', '0x8234567890abcdef1234567890abcdef12345678', '♟️', 'Strategic arena player', 'USA', 'en', 860, true),
  ('00000000-0000-0000-0000-000000000009', 'HasanAbi', 'hasan@example.com', '0x9234567890abcdef1234567890abcdef12345678', '🗣️', 'Arena commentator and player', 'USA', 'en', 820, true),
  ('00000000-0000-0000-0000-000000000010', 'Faker', 'faker@example.com', '0xa234567890abcdef1234567890abcdef12345678', '👾', 'Legendary robot pilot', 'South Korea', 'ko', 980, true),
  ('00000000-0000-0000-0000-000000000011', 'Ninja', 'ninja@example.com', '0xb234567890abcdef1234567890abcdef12345678', '🥷', 'Multi-platform champion', 'USA', 'en', 930, true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- WALLETS (for each user)
-- ================================================
INSERT INTO wallets (user_id, pac_balance, gac_balance, locked_pac_balance, locked_gac_balance)
VALUES
  ('00000000-0000-0000-0000-000000000001', 100000.00, 10000.00, 0.00, 0.00),
  ('00000000-0000-0000-0000-000000000002', 25678.50, 1500.00, 500.00, 100.00),
  ('00000000-0000-0000-0000-000000000003', 18945.25, 800.00, 200.00, 0.00),
  ('00000000-0000-0000-0000-000000000004', 32156.80, 2000.00, 1000.00, 200.00),
  ('00000000-0000-0000-0000-000000000005', 22890.40, 1200.00, 300.00, 50.00),
  ('00000000-0000-0000-0000-000000000006', 28456.90, 1800.00, 600.00, 150.00),
  ('00000000-0000-0000-0000-000000000007', 15234.60, 600.00, 100.00, 0.00),
  ('00000000-0000-0000-0000-000000000008', 19876.30, 900.00, 250.00, 25.00),
  ('00000000-0000-0000-0000-000000000009', 14567.80, 500.00, 150.00, 0.00),
  ('00000000-0000-0000-0000-000000000010', 35789.20, 2500.00, 1200.00, 300.00),
  ('00000000-0000-0000-0000-000000000011', 27345.70, 1600.00, 400.00, 75.00)
ON CONFLICT (user_id) DO NOTHING;

-- ================================================
-- ARENAS (10 diverse arenas)
-- ================================================
INSERT INTO arenas (id, name, slug, description, arena_type, address, city, country, latitude, longitude, status, base_price_per_minute, capacity, features, opening_hours, rules, is_verified)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'NYC Track Alpha', 'nyc-track-alpha', 'Premier robot racing track in the heart of Manhattan', 'outdoor', '123 Broadway', 'New York', 'USA', 40.7580, -73.9855, 'active', 2.50, 50, '{"cameras": 8, "lighting": "professional", "surface": "carbon fiber"}', '{"monday": "09:00-22:00", "friday": "09:00-00:00"}', '{"max_speed": "80km/h", "min_age": 13}', true),
  ('10000000-0000-0000-0000-000000000002', 'Tokyo Arcade', 'tokyo-arcade', 'High-tech arcade with latest claw games and robots', 'indoor', 'Shibuya 2-chome', 'Tokyo', 'Japan', 35.6762, 139.6503, 'active', 1.80, 100, '{"games": 45, "vr_stations": 6, "prize_pool": "daily"}', '{"everyday": "10:00-23:00"}', '{"family_friendly": true}', true),
  ('10000000-0000-0000-0000-000000000003', 'London Drone Arena', 'london-drone-arena', 'Professional FPV drone racing circuit', 'indoor', '45 Tech Street', 'London', 'UK', 51.5074, -0.1278, 'active', 3.00, 30, '{"obstacles": 25, "checkpoints": 12, "safety_nets": true}', '{"weekdays": "14:00-22:00", "weekends": "10:00-23:00"}', '{"fpv_required": true, "license": "level_2"}', true),
  ('10000000-0000-0000-0000-000000000004', 'Berlin Robot Combat', 'berlin-robot-combat', 'Intense robot battle arena with professional equipment', 'indoor', 'Alexanderplatz 10', 'Berlin', 'Germany', 52.5200, 13.4050, 'active', 2.80, 40, '{"battle_zone": "15x15m", "armor_rating": "class_C", "weapons": "approved_list"}', '{"tuesday-sunday": "12:00-22:00"}', '{"weight_limit": "50kg", "safety_inspection": true}', true),
  ('10000000-0000-0000-0000-000000000005', 'Singapore Sky Track', 'singapore-sky-track', 'Rooftop drone racing with stunning city views', 'outdoor', 'Marina Bay', 'Singapore', 'Singapore', 1.2800, 103.8500, 'active', 3.50, 25, '{"altitude": "200m", "wind_protection": true, "night_racing": true}', '{"everyday": "06:00-22:00"}', '{"weather_dependent": true, "pilot_license": "required"}', true),
  ('10000000-0000-0000-0000-000000000006', 'Moscow Ice Arena', 'moscow-ice-arena', 'Unique ice-based robot racing and challenges', 'indoor', 'Red Square Complex', 'Moscow', 'Russia', 55.7558, 37.6173, 'active', 2.20, 60, '{"ice_surface": true, "temperature": "-5C", "grip_tires": "provided"}', '{"everyday": "11:00-23:00"}', '{"cold_weather_gear": "recommended"}', true),
  ('10000000-0000-0000-0000-000000000007', 'Dubai Desert Rally', 'dubai-desert-rally', 'Extreme outdoor desert terrain for rugged robots', 'outdoor', 'Dubai Silicon Oasis', 'Dubai', 'UAE', 25.1207, 55.3647, 'active', 4.00, 20, '{"terrain": "sand_dunes", "temperature_control": true, "night_vision": true}', '{"winter": "10:00-20:00", "summer": "18:00-02:00"}', '{"heat_resistant": "required", "dust_proof": true}', true),
  ('10000000-0000-0000-0000-000000000008', 'Seoul Tech Arena', 'seoul-tech-arena', 'Cutting-edge arena with AI-powered challenges', 'indoor', 'Gangnam District', 'Seoul', 'South Korea', 37.4979, 127.0276, 'active', 2.60, 80, '{"ai_opponents": true, "holographic_displays": 10, "5g_network": true}', '{"everyday": "09:00-midnight"}', '{"tech_level": "advanced"}', true),
  ('10000000-0000-0000-0000-000000000009', 'Paris Escape Rooms', 'paris-escape-rooms', 'Robot-controlled escape room challenges', 'indoor', 'Champs-Élysées 88', 'Paris', 'France', 48.8738, 2.2950, 'active', 2.00, 30, '{"rooms": 8, "difficulty_levels": 5, "multi_robot": true}', '{"everyday": "10:00-22:00"}', '{"team_size": "2-6", "time_limit": "60min"}', true),
  ('10000000-0000-0000-0000-000000000010', 'Sydney Beach Bots', 'sydney-beach-bots', 'Beach-based amphibious robot arena', 'outdoor', 'Bondi Beach Road', 'Sydney', 'Australia', -33.8908, 151.2743, 'active', 2.40, 35, '{"water_resistant": true, "beach_terrain": true, "surf_zone": true}', '{"summer": "07:00-21:00", "winter": "09:00-18:00"}', '{"waterproof_required": true, "tide_dependent": true}', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- DEVICE TYPES
-- ================================================
INSERT INTO device_types (id, name, category, description, specifications, default_capabilities, image_url)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Speed Racer X1', 'robot', 'High-speed racing robot with carbon fiber chassis', '{"max_speed": "80km/h", "weight": "15kg", "battery": "2h"}', '{"racing": true, "autonomous": false}', '/devices/racer-x1.jpg'),
  ('20000000-0000-0000-0000-000000000002', 'Combat Bot MK2', 'robot', 'Battle robot with spinning weapon', '{"weapon": "spinner", "weight": "45kg", "armor": "titanium"}', '{"combat": true, "weapon_control": true}', '/devices/combat-mk2.jpg'),
  ('20000000-0000-0000-0000-000000000003', 'FPV Drone Pro', 'drone', 'Professional FPV racing drone', '{"max_speed": "150km/h", "camera": "4K", "range": "2km"}', '{"fpv": true, "racing": true, "acrobatics": true}', '/devices/fpv-pro.jpg'),
  ('20000000-0000-0000-0000-000000000004', 'Claw Master 3000', 'crawler', 'Precision claw machine with HD camera', '{"grip_force": "5kg", "camera": "1080p", "precision": "±1mm"}', '{"claw_control": true, "precision_mode": true}', '/devices/claw-3000.jpg'),
  ('20000000-0000-0000-0000-000000000005', 'All-Terrain Crawler', 'crawler', 'Six-wheeled terrain exploration robot', '{"wheels": 6, "waterproof": "IP67", "sensors": "lidar+camera"}', '{"terrain_navigation": true, "autonomous": true}', '/devices/crawler-at.jpg')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- DEVICES (50+ devices across arenas)
-- ================================================
-- NYC Track Alpha devices (10)
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, raspberry_pi_id, battery_level, firmware_version, capabilities)
SELECT
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Racer-NYC-' || n,
  'SN-NYC-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 6 THEN 'online' WHEN n <= 8 THEN 'in_use' ELSE 'offline' END,
  'RPI-NYC-' || n,
  CASE WHEN n <= 8 THEN 60 + (n * 5) ELSE 15 END,
  '2.1.5',
  '{"racing": true, "top_speed": "75km/h"}'::jsonb
FROM generate_series(1, 10) AS n
ON CONFLICT (serial_number) DO NOTHING;

-- Tokyo Arcade devices (15)
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, raspberry_pi_id, battery_level, firmware_version, capabilities)
SELECT
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000004',
  'Claw-TKY-' || n,
  'SN-TKY-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 10 THEN 'online' WHEN n <= 12 THEN 'in_use' ELSE 'maintenance' END,
  'RPI-TKY-' || n,
  CASE WHEN n <= 12 THEN 70 + (n * 2) ELSE 25 END,
  '1.8.3',
  '{"claw": true, "precision": "high"}'::jsonb
FROM generate_series(1, 15) AS n
ON CONFLICT (serial_number) DO NOTHING;

-- London Drone Arena devices (8)
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, raspberry_pi_id, battery_level, firmware_version, capabilities)
SELECT
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000003',
  'Drone-LDN-' || n,
  'SN-LDN-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 5 THEN 'online' WHEN n <= 6 THEN 'in_use' ELSE 'offline' END,
  'RPI-LDN-' || n,
  CASE WHEN n <= 6 THEN 80 + (n * 3) ELSE 10 END,
  '3.0.2',
  '{"fpv": true, "max_speed": "140km/h"}'::jsonb
FROM generate_series(1, 8) AS n
ON CONFLICT (serial_number) DO NOTHING;

-- Berlin Robot Combat devices (12)
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, raspberry_pi_id, battery_level, firmware_version, capabilities)
SELECT
  '10000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000002',
  'Combat-BER-' || n,
  'SN-BER-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 7 THEN 'online' WHEN n <= 9 THEN 'in_use' WHEN n = 10 THEN 'broken' ELSE 'maintenance' END,
  'RPI-BER-' || n,
  CASE WHEN n <= 9 THEN 65 + (n * 3) ELSE 5 END,
  '2.5.1',
  '{"combat": true, "weapon": "spinner", "armor": "level_3"}'::jsonb
FROM generate_series(1, 12) AS n
ON CONFLICT (serial_number) DO NOTHING;

-- ================================================
-- TOURNAMENTS (10 tournaments in various states)
-- ================================================
INSERT INTO tournaments (id, arena_id, name, slug, description, tournament_type, max_participants, entry_fee_pac, prize_pool_pac, start_time, end_time, registration_deadline, status, rules, current_participants)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'NYC Speed Championship', 'nyc-speed-championship', 'Annual high-speed robot racing championship', 'single_elimination', 64, 100.00, 5000.00, NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days', NOW() + INTERVAL '4 days', 'registration_open', '{"laps": 10, "qualification": true}', 42),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Berlin Battle Royale', 'berlin-battle-royale', 'Ultimate robot combat tournament', 'double_elimination', 32, 150.00, 8000.00, NOW() + INTERVAL '10 days', NOW() + INTERVAL '12 days', NOW() + INTERVAL '8 days', 'registration_open', '{"rounds": 3, "knockout": true}', 28),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'London FPV Masters', 'london-fpv-masters', 'Professional drone racing elite tournament', 'round_robin', 16, 200.00, 12000.00, NOW() + INTERVAL '15 days', NOW() + INTERVAL '17 days', NOW() + INTERVAL '12 days', 'registration_open', '{"laps": 5, "time_trial": true}', 14),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Tokyo Claw Games Fest', 'tokyo-claw-games-fest', 'Annual arcade games festival', 'league', 100, 50.00, 3000.00, NOW() + INTERVAL '3 days', NOW() + INTERVAL '6 days', NOW() + INTERVAL '2 days', 'registration_open', '{"games": 20, "points_based": true}', 87),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Singapore Sky Series', 'singapore-sky-series', 'High-altitude drone racing series', 'single_elimination', 24, 180.00, 7500.00, NOW() - INTERVAL '2 days', NOW() + INTERVAL '2 days', NOW() - INTERVAL '3 days', 'active', '{"altitude": "max_200m", "night_racing": false}', 24),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', 'Seoul Tech Challenge', 'seoul-tech-challenge', 'AI-powered robot challenge tournament', 'round_robin', 20, 120.00, 6000.00, NOW() + INTERVAL '20 days', NOW() + INTERVAL '23 days', NOW() + INTERVAL '18 days', 'registration_open', '{"ai_allowed": true, "difficulty": "hard"}', 16),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Dubai Desert Rally', 'dubai-desert-rally', 'Extreme desert terrain racing', 'single_elimination', 32, 250.00, 15000.00, NOW() + INTERVAL '30 days', NOW() + INTERVAL '33 days', NOW() + INTERVAL '25 days', 'registration_open', '{"terrain": "sand", "weather_dependent": true}', 8),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000006', 'Moscow Winter Games', 'moscow-winter-games', 'Ice-based robot competition', 'league', 40, 80.00, 4000.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '12 days', 'finished', '{"ice_surface": true, "temperature": "-5C"}', 40),
  ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Paris Escape Masters', 'paris-escape-masters', 'Elite escape room championship', 'single_elimination', 16, 100.00, 4500.00, NOW() + INTERVAL '8 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '6 days', 'registration_open', '{"difficulty": "expert", "time_limit": "45min"}', 12),
  ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'Sydney Amphibious Race', 'sydney-amphibious-race', 'Beach and water robot racing', 'round_robin', 12, 160.00, 5500.00, NOW() + INTERVAL '12 days', NOW() + INTERVAL '14 days', NOW() + INTERVAL '10 days', 'registration_open', '{"waterproof": true, "tide_schedule": "attached"}', 9)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- GAME SESSIONS (active and recent)
-- ================================================
-- Create some active game sessions
INSERT INTO game_sessions (id, arena_id, user_id, device_id, game_mode, status, start_time, score, session_data)
SELECT
  gen_random_uuid(),
  '10000000-0000-0000-0000-00000000000' || ((n % 10) + 1),
  '00000000-0000-0000-0000-00000000000' || ((n % 10) + 2),
  (SELECT id FROM devices WHERE status = 'in_use' LIMIT 1 OFFSET (n % 5)),
  CASE WHEN n % 3 = 0 THEN 'time_trial' WHEN n % 3 = 1 THEN 'free_play' ELSE 'challenge' END,
  'active',
  NOW() - (n || ' minutes')::INTERVAL,
  n * 150,
  jsonb_build_object('viewers', n * 100 + 500, 'laps_completed', n % 10)
FROM generate_series(1, 12) AS n;

-- ================================================
-- ACHIEVEMENTS
-- ================================================
INSERT INTO achievements (name, slug, achievement_category, tier, description, requirements, pac_reward, icon_url)
VALUES
  ('First Blood', 'first-blood', 'gameplay', 'bronze', 'Win your first game', '{"games_won": 1}', 10.00, '🏆'),
  ('Speed Demon', 'speed-demon', 'gameplay', 'silver', 'Complete a lap in under 30 seconds', '{"lap_time": 30}', 25.00, '⚡'),
  ('Combat Master', 'combat-master', 'gameplay', 'gold', 'Win 50 combat matches', '{"combat_wins": 50}', 100.00, '⚔️'),
  ('Arena Tourist', 'arena-tourist', 'social', 'bronze', 'Visit 5 different arenas', '{"arenas_visited": 5}', 15.00, '🗺️'),
  ('Social Butterfly', 'social-butterfly', 'social', 'silver', 'Add 25 friends', '{"friends": 25}', 30.00, '🦋'),
  ('Tournament Champion', 'tournament-champion', 'tournament', 'gold', 'Win a tournament', '{"tournaments_won": 1}', 200.00, '👑'),
  ('Marathon Runner', 'marathon-runner', 'gameplay', 'platinum', 'Play for 100 hours total', '{"playtime_hours": 100}', 500.00, '🏃'),
  ('Perfect Score', 'perfect-score', 'gameplay', 'diamond', 'Achieve a perfect score in any game mode', '{"perfect_games": 1}', 1000.00, '💎')
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- SYSTEM SETTINGS (if not already populated by migration)
-- ================================================
INSERT INTO system_settings (key, value, description)
VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('registration_enabled', 'true', 'Allow new user registrations'),
  ('min_game_price', '0.50', 'Minimum price per minute for games'),
  ('max_game_price', '10.00', 'Maximum price per minute for games'),
  ('tournament_fee_percentage', '10', 'Platform fee percentage for tournaments'),
  ('pac_to_usd_rate', '0.15', 'Current PAC to USD exchange rate'),
  ('gac_to_usd_rate', '2.45', 'Current GAC to USD exchange rate')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ================================================
-- FEATURE FLAGS
-- ================================================
INSERT INTO feature_flags (flag_name, is_enabled, description, rollout_percentage)
VALUES
  ('tournaments_v2', true, 'New tournament system with brackets', 100),
  ('nft_marketplace', false, 'NFT trading marketplace', 0),
  ('blockchain_integration', false, 'Solana blockchain integration', 0),
  ('live_streaming', true, 'Live game streaming feature', 100),
  ('chat_system', true, 'Real-time chat system', 100),
  ('betting_system', false, 'Game betting system', 0),
  ('ai_opponents', true, 'AI-powered opponent robots', 50)
ON CONFLICT (flag_name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

COMMIT;

-- Summary
SELECT
  'Users' as table_name, COUNT(*) as records FROM users
UNION ALL SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL SELECT 'Arenas', COUNT(*) FROM arenas
UNION ALL SELECT 'Device Types', COUNT(*) FROM device_types
UNION ALL SELECT 'Devices', COUNT(*) FROM devices
UNION ALL SELECT 'Tournaments', COUNT(*) FROM tournaments
UNION ALL SELECT 'Game Sessions', COUNT(*) FROM game_sessions
UNION ALL SELECT 'Achievements', COUNT(*) FROM achievements
ORDER BY table_name;
