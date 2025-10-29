-- ==========================================
-- GiperARENA Seed Data (Fixed for actual schema)
-- ==========================================

BEGIN;

SET search_path TO giperarena;

-- ==========================================
-- 1. USERS (11 users)
-- ==========================================

INSERT INTO users (id, username, email, wallet_address, avatar_url, is_verified, is_active, metadata)
VALUES
  -- Admin user
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@giperarena.space', '0x1234567890abcdef1234567890abcdef12345678', '🛡️', true, true,
   '{"bio": "GiperARENA Administrator", "country": "USA", "reputation_score": 1000, "role": "admin"}'::jsonb),

  -- Regular users (streamers & gamers)
  ('00000000-0000-0000-0000-000000000002', 'Caedrel', 'caedrel@example.com', '0x2234567890abcdef1234567890abcdef12345678', '👑', true, true,
   '{"bio": "Professional robot racer from UK. Former eSports champion.", "country": "UK", "reputation_score": 950, "twitch": "caedrel"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'summit1g', 'summit@example.com', '0x3234567890abcdef1234567890abcdef12345678', '⚡', true, true,
   '{"bio": "Claw game master and variety streamer", "country": "USA", "reputation_score": 920, "twitch": "summit1g"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'xQc', 'xqc@example.com', '0x4234567890abcdef1234567890abcdef12345678', '🔥', true, true,
   '{"bio": "JUICE! Combat bot enthusiast", "country": "Canada", "reputation_score": 880, "twitch": "xqcow"}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', 'Pokimane', 'pokimane@example.com', '0x5234567890abcdef1234567890abcdef12345678', '✨', true, true,
   '{"bio": "Drone racing champion. Building the future!", "country": "Canada", "reputation_score": 910, "twitch": "pokimane"}'::jsonb),
  ('00000000-0000-0000-0000-000000000006', 'Shroud', 'shroud@example.com', '0x6234567890abcdef1234567890abcdef12345678', '🎯', true, true,
   '{"bio": "Precision control specialist", "country": "Canada", "reputation_score": 975, "twitch": "shroud"}'::jsonb),
  ('00000000-0000-0000-0000-000000000007', 'Tfue', 'tfue@example.com', '0x7234567890abcdef1234567890abcdef12345678', '💪', true, true,
   '{"bio": "Aggressive racer, tournament grinder", "country": "USA", "reputation_score": 890, "twitch": "tfue"}'::jsonb),
  ('00000000-0000-0000-0000-000000000008', 'Ninja', 'ninja@example.com', '0x8234567890abcdef1234567890abcdef12345678', '🥷', true, true,
   '{"bio": "Fast reflexes, faster robots", "country": "USA", "reputation_score": 930, "twitch": "ninja"}'::jsonb),
  ('00000000-0000-0000-0000-000000000009', 'DrDisrespect', 'drdisrespect@example.com', '0x9234567890abcdef1234567890abcdef12345678', '🕶️', true, true,
   '{"bio": "Two-time champion of the arena", "country": "USA", "reputation_score": 940, "twitch": "drdisrespect"}'::jsonb),
  ('00000000-0000-0000-0000-000000000010', 'Sykkuno', 'sykkuno@example.com', '0xa234567890abcdef1234567890abcdef12345678', '🌸', true, true,
   '{"bio": "I just play for fun...", "country": "USA", "reputation_score": 860, "twitch": "sykkuno"}'::jsonb),
  ('00000000-0000-0000-0000-000000000011', 'Valkyrae', 'valkyrae@example.com', '0xb234567890abcdef1234567890abcdef12345678', '👑', true, true,
   '{"bio": "Queen of the arena", "country": "USA", "reputation_score": 905, "youtube": "valkyrae"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. WALLETS (11 wallets for users)
-- ==========================================

INSERT INTO wallets (user_id, pac_balance, gac_balance, staked_gac, staking_tier, total_earned, total_spent)
VALUES
  -- Admin wallet
  ('00000000-0000-0000-0000-000000000001', 100000.00, 50000.00, 0, 'none', 150000.00, 0),

  -- Player wallets with various balances
  ('00000000-0000-0000-0000-000000000002', 12500.00, 5000.00, 50000.00, 'gold', 45000.00, 32500.00),
  ('00000000-0000-0000-0000-000000000003', 8900.00, 1500.00, 10000.00, 'silver', 35000.00, 26100.00),
  ('00000000-0000-0000-0000-000000000004', 15200.00, 2200.00, 1000.00, 'bronze', 52000.00, 36800.00),
  ('00000000-0000-0000-0000-000000000005', 9500.00, 3800.00, 10000.00, 'silver', 40000.00, 30500.00),
  ('00000000-0000-0000-0000-000000000006', 18700.00, 8500.00, 100000.00, 'platinum', 78000.00, 59300.00),
  ('00000000-0000-0000-0000-000000000007', 6800.00, 900.00, 1000.00, 'bronze', 28000.00, 21200.00),
  ('00000000-0000-0000-0000-000000000008', 11200.00, 2700.00, 10000.00, 'silver', 42000.00, 30800.00),
  ('00000000-0000-0000-0000-000000000009', 13400.00, 4100.00, 50000.00, 'gold', 55000.00, 41600.00),
  ('00000000-0000-0000-0000-000000000010', 4200.00, 600.00, 0, 'none', 18000.00, 13800.00),
  ('00000000-0000-0000-0000-000000000011', 7600.00, 1800.00, 1000.00, 'bronze', 32000.00, 24400.00)
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================
-- 3. ARENAS (10 diverse global arenas)
-- ==========================================

INSERT INTO arenas (id, name, description, operator_id, location_address, location_coordinates, status, arena_type, price_per_minute, currency, max_players, features, media_urls, rating, total_games, is_verified, metadata)
VALUES
  ('10000000-0000-0000-0000-000000000001',
   'NYC Track Alpha',
   'Premier robot racing track in the heart of Manhattan with 4K cameras and professional obstacles',
   '00000000-0000-0000-0000-000000000001',
   'New York, NY, USA',
   ST_SetSRID(ST_MakePoint(-73.9855, 40.7580), 4326)::geography,
   'active',
   'racing',
   2.50,
   'PAC',
   2,
   '["4K cameras", "Professional obstacles", "LED lighting", "Real-time telemetry"]'::jsonb,
   '{"images": ["https://example.com/nyc-track-1.jpg"], "videos": ["https://example.com/nyc-track.mp4"]}'::jsonb,
   4.8,
   1247,
   true,
   '{"city": "New York", "country": "USA", "timezone": "America/New_York"}'::jsonb),

  ('10000000-0000-0000-0000-000000000002',
   'Tokyo Arcade',
   'High-tech indoor arcade with claw machines and prize games',
   '00000000-0000-0000-0000-000000000001',
   'Shibuya, Tokyo, Japan',
   ST_SetSRID(ST_MakePoint(139.6503, 35.6762), 4326)::geography,
   'active',
   'arcade',
   1.80,
   'PAC',
   1,
   '["Prize pool", "RGB lighting", "Anime prizes", "Multiple machines"]'::jsonb,
   '{"images": ["https://example.com/tokyo-arcade-1.jpg"], "videos": []}'::jsonb,
   4.7,
   892,
   true,
   '{"city": "Tokyo", "country": "Japan", "timezone": "Asia/Tokyo"}'::jsonb),

  ('10000000-0000-0000-0000-000000000003',
   'London Combat Arena',
   'Combat robot arena with reinforced walls and weapon systems',
   '00000000-0000-0000-0000-000000000001',
   'Camden, London, UK',
   ST_SetSRID(ST_MakePoint(-0.1278, 51.5074), 4326)::geography,
   'active',
   'combat',
   3.20,
   'PAC',
   2,
   '["Reinforced arena", "Weapon systems", "Multi-angle cameras", "Safety barriers"]'::jsonb,
   '{"images": ["https://example.com/london-combat-1.jpg"], "videos": ["https://example.com/london-combat.mp4"]}'::jsonb,
   4.9,
   673,
   true,
   '{"city": "London", "country": "UK", "timezone": "Europe/London"}'::jsonb),

  ('10000000-0000-0000-0000-000000000004',
   'Berlin Drone Zone',
   'Indoor drone racing circuit with FPV gates and obstacles',
   '00000000-0000-0000-0000-000000000002',
   'Kreuzberg, Berlin, Germany',
   ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326)::geography,
   'active',
   'drone_racing',
   2.80,
   'PAC',
   4,
   '["FPV gates", "LED obstacles", "Multi-path circuit", "Low latency streaming"]'::jsonb,
   '{"images": [], "videos": []}'::jsonb,
   4.6,
   543,
   true,
   '{"city": "Berlin", "country": "Germany", "timezone": "Europe/Berlin"}'::jsonb),

  ('10000000-0000-0000-0000-000000000005',
   'Singapore Tech Park',
   'Futuristic outdoor arena with AI-controlled obstacles',
   '00000000-0000-0000-0000-000000000002',
   'Marina Bay, Singapore',
   ST_SetSRID(ST_MakePoint(103.8198, 1.3521), 4326)::geography,
   'active',
   'racing',
   2.90,
   'PAC',
   2,
   '["AI obstacles", "Weather resistant", "5G connectivity", "Night racing"]'::jsonb,
   '{"images": ["https://example.com/singapore-1.jpg"], "videos": []}'::jsonb,
   4.5,
   421,
   true,
   '{"city": "Singapore", "country": "Singapore", "timezone": "Asia/Singapore"}'::jsonb),

  ('10000000-0000-0000-0000-000000000006',
   'Moscow Winter Arena',
   'Indoor arena for snow and ice terrain robots',
   '00000000-0000-0000-0000-000000000002',
   'Moscow, Russia',
   ST_SetSRID(ST_MakePoint(37.6173, 55.7558), 4326)::geography,
   'maintenance',
   'racing',
   2.20,
   'PAC',
   2,
   '["Snow terrain", "Ice obstacles", "Heated viewing", "Winter sports theme"]'::jsonb,
   '{"images": [], "videos": []}'::jsonb,
   4.3,
   312,
   false,
   '{"city": "Moscow", "country": "Russia", "timezone": "Europe/Moscow"}'::jsonb),

  ('10000000-0000-0000-0000-000000000007',
   'Dubai Desert Crawl',
   'Outdoor desert terrain for crawler robots',
   '00000000-0000-0000-0000-000000000003',
   'Dubai, UAE',
   ST_SetSRID(ST_MakePoint(55.2708, 25.2048), 4326)::geography,
   'active',
   'crawling',
   2.00,
   'PAC',
   1,
   '["Desert terrain", "Sand dunes", "Extreme temperature", "Solar powered"]'::jsonb,
   '{"images": ["https://example.com/dubai-desert.jpg"], "videos": []}'::jsonb,
   4.4,
   287,
   true,
   '{"city": "Dubai", "country": "UAE", "timezone": "Asia/Dubai"}'::jsonb),

  ('10000000-0000-0000-0000-000000000008',
   'Seoul Gaming Center',
   'Premium gaming hub with multiple robot types',
   '00000000-0000-0000-0000-000000000003',
   'Gangnam, Seoul, South Korea',
   ST_SetSRID(ST_MakePoint(127.0276, 37.5665), 4326)::geography,
   'active',
   'arcade',
   2.60,
   'PAC',
   1,
   '["Multiple game types", "Prize redemption", "VIP lounges", "Streaming booths"]'::jsonb,
   '{"images": [], "videos": []}'::jsonb,
   4.7,
   756,
   true,
   '{"city": "Seoul", "country": "South Korea", "timezone": "Asia/Seoul"}'::jsonb),

  ('10000000-0000-0000-0000-000000000009',
   'Paris Combat Club',
   'European combat robot championship venue',
   '00000000-0000-0000-0000-000000000003',
   'Paris, France',
   ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography,
   'active',
   'combat',
   3.50,
   'PAC',
   2,
   '["Championship grade", "Bulletproof glass", "Pro commentary", "Instant replay"]'::jsonb,
   '{"images": ["https://example.com/paris-combat.jpg"], "videos": ["https://example.com/paris-combat.mp4"]}'::jsonb,
   4.8,
   524,
   true,
   '{"city": "Paris", "country": "France", "timezone": "Europe/Paris"}'::jsonb),

  ('10000000-0000-0000-0000-000000000010',
   'Sydney Beach Track',
   'Beachside racing track with sand and water obstacles',
   '00000000-0000-0000-0000-000000000004',
   'Bondi Beach, Sydney, Australia',
   ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography,
   'active',
   'racing',
   2.30,
   'PAC',
   2,
   '["Beach terrain", "Water obstacles", "Ocean view", "Weather dependent"]'::jsonb,
   '{"images": [], "videos": []}'::jsonb,
   4.6,
   389,
   true,
   '{"city": "Sydney", "country": "Australia", "timezone": "Australia/Sydney"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. DEVICE TYPES (5 types)
-- ==========================================

INSERT INTO device_types (id, name, category, description, specifications, metadata)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Racing Robot', 'racing', 'High-speed racing robot with 4WD',
   '{"max_speed": "50 km/h", "battery_life": "30 min", "weight": "2.5 kg"}'::jsonb,
   '{"compatible_arenas": ["racing"], "difficulty": "medium"}'::jsonb),

  ('20000000-0000-0000-0000-000000000002', 'Combat Bot', 'combat', 'Armored combat robot with weapon system',
   '{"max_speed": "20 km/h", "armor": "reinforced steel", "weapon": "spinner"}'::jsonb,
   '{"compatible_arenas": ["combat"], "difficulty": "hard"}'::jsonb),

  ('20000000-0000-0000-0000-000000000003', 'FPV Drone', 'drone', 'First-person view racing drone',
   '{"max_speed": "120 km/h", "camera": "4K 60fps", "range": "500m"}'::jsonb,
   '{"compatible_arenas": ["drone_racing"], "difficulty": "hard"}'::jsonb),

  ('20000000-0000-0000-0000-000000000004', 'Claw Machine', 'arcade', 'Prize claw machine with adjustable grip',
   '{"grip_strength": "adjustable", "prize_capacity": "50 items", "claw_type": "3-prong"}'::jsonb,
   '{"compatible_arenas": ["arcade"], "difficulty": "easy"}'::jsonb),

  ('20000000-0000-0000-0000-000000000005', 'Crawler Robot', 'crawling', 'All-terrain crawler with suspension',
   '{"max_speed": "15 km/h", "suspension": "independent 4-wheel", "clearance": "20cm"}'::jsonb,
   '{"compatible_arenas": ["crawling"], "difficulty": "medium"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. DEVICES (Generate devices for arenas)
-- ==========================================

-- NYC Track Alpha - 10 racing robots
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Racer-NYC-' || n,
  'SN-NYC-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 6 THEN 'online' WHEN n <= 8 THEN 'in_use' ELSE 'offline' END,
  CASE WHEN n <= 8 THEN 60 + (n * 5) ELSE 15 END,
  'ws://nyc-track-alpha.local:' || (8000 + n),
  'rpi-nyc-' || n,
  ('{"color": "' || (ARRAY['red', 'blue', 'green', 'yellow', 'purple'])[((n-1) % 5) + 1] || '", "number": ' || n || '}')::jsonb
FROM generate_series(1, 10) AS n
ON CONFLICT DO NOTHING;

-- Tokyo Arcade - 8 claw machines
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000004',
  'Claw-TKO-' || n,
  'SN-TKO-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 5 THEN 'online' WHEN n <= 6 THEN 'in_use' ELSE 'maintenance' END,
  100, -- Claw machines are plugged in
  'ws://tokyo-arcade.local:' || (8000 + n),
  'rpi-tko-' || n,
  ('{"prize_type": "' || (ARRAY['plushie', 'figure', 'keychain', 'electronics'])[((n-1) % 4) + 1] || '"}')::jsonb
FROM generate_series(1, 8) AS n
ON CONFLICT DO NOTHING;

-- London Combat Arena - 6 combat bots
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Warrior-LON-' || n,
  'SN-LON-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 4 THEN 'online' WHEN n <= 5 THEN 'in_use' ELSE 'maintenance' END,
  CASE WHEN n <= 5 THEN 75 ELSE 20 END,
  'ws://london-combat.local:' || (8000 + n),
  'rpi-lon-' || n,
  ('{"weapon_type": "' || (ARRAY['spinner', 'flipper', 'hammer'])[((n-1) % 3) + 1] || '"}')::jsonb
FROM generate_series(1, 6) AS n
ON CONFLICT DO NOTHING;

-- Berlin Drone Zone - 8 drones
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000003',
  'Falcon-BER-' || n,
  'SN-BER-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 6 THEN 'online' WHEN n = 7 THEN 'in_use' ELSE 'offline' END,
  CASE WHEN n <= 7 THEN 85 ELSE 10 END,
  'ws://berlin-drone-zone.local:' || (8000 + n),
  'rpi-ber-' || n,
  ('{"fpv_enabled": true, "camera_angle": ' || (25 + n * 5) || '}')::jsonb
FROM generate_series(1, 8) AS n
ON CONFLICT DO NOTHING;

-- Singapore Tech Park - 6 racing robots
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000001',
  'Racer-SIN-' || n,
  'SN-SIN-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 4 THEN 'online' WHEN n = 5 THEN 'in_use' ELSE 'offline' END,
  CASE WHEN n <= 5 THEN 70 ELSE 12 END,
  'ws://singapore-tech-park.local:' || (8000 + n),
  'rpi-sin-' || n,
  ('{"ai_assist": true}')::jsonb
FROM generate_series(1, 6) AS n
ON CONFLICT DO NOTHING;

-- Dubai Desert Crawl - 5 crawler robots
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000005',
  'Crawler-DXB-' || n,
  'SN-DXB-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 3 THEN 'online' ELSE 'offline' END,
  CASE WHEN n <= 3 THEN 55 ELSE 8 END,
  'ws://dubai-desert-crawl.local:' || (8000 + n),
  'rpi-dxb-' || n,
  ('{"terrain_type": "desert"}')::jsonb
FROM generate_series(1, 5) AS n
ON CONFLICT DO NOTHING;

-- Seoul Gaming Center - 7 claw machines
INSERT INTO devices (arena_id, device_type_id, name, serial_number, status, battery_level, control_endpoint, raspberry_pi_id, metadata)
SELECT
  '10000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000004',
  'Claw-SEL-' || n,
  'SN-SEL-' || LPAD(n::text, 3, '0'),
  CASE WHEN n <= 6 THEN 'online' ELSE 'maintenance' END,
  100,
  'ws://seoul-gaming-center.local:' || (8000 + n),
  'rpi-sel-' || n,
  ('{"kpop_themed": true}')::jsonb
FROM generate_series(1, 7) AS n
ON CONFLICT DO NOTHING;

-- ==========================================
-- 6. TOURNAMENTS (10 tournaments)
-- ==========================================

INSERT INTO tournaments (id, name, description, organizer_id, arena_id, tournament_type, status, entry_fee, prize_pool, max_participants, current_participants, start_date, end_date, metadata)
VALUES
  ('30000000-0000-0000-0000-000000000001',
   'NYC Speed Championship',
   'Premier racing tournament with $5000 prize pool',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'single_elimination',
   'registration',
   100.00,
   5000.00,
   32,
   18,
   NOW() + INTERVAL '3 days',
   NOW() + INTERVAL '5 days',
   '{"sponsored_by": "GiperARENA", "broadcast": "Twitch"}'::jsonb),

  ('30000000-0000-0000-0000-000000000002',
   'Tokyo Prize Masters',
   'Claw machine competition - Win rare prizes!',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   'round_robin',
   'upcoming',
   50.00,
   2000.00,
   16,
   8,
   NOW() + INTERVAL '7 days',
   NOW() + INTERVAL '8 days',
   '{"prize_theme": "anime", "special_items": true}'::jsonb),

  ('30000000-0000-0000-0000-000000000003',
   'London Combat Royale',
   'Epic robot battles - Last bot standing wins',
   '00000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000003',
   'double_elimination',
   'in_progress',
   150.00,
   8000.00,
   16,
   16,
   NOW() - INTERVAL '2 hours',
   NOW() + INTERVAL '6 hours',
   '{"combat_rules": "standard", "damage_allowed": "high"}'::jsonb),

  ('30000000-0000-0000-0000-000000000004',
   'Berlin FPV Championship',
   'High-speed drone racing tournament',
   '00000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000004',
   'single_elimination',
   'registration',
   80.00,
   3500.00,
   24,
   12,
   NOW() + INTERVAL '4 days',
   NOW() + INTERVAL '5 days',
   '{"fpv_mode": "required", "track_difficulty": "expert"}'::jsonb),

  ('30000000-0000-0000-0000-000000000005',
   'Singapore Night Race',
   'Evening racing under the lights',
   '00000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000005',
   'swiss',
   'upcoming',
   75.00,
   3000.00,
   20,
   5,
   NOW() + INTERVAL '10 days',
   NOW() + INTERVAL '11 days',
   '{"time": "night", "led_enabled": true}'::jsonb),

  ('30000000-0000-0000-0000-000000000006',
   'Global Championship Finals',
   'World championship - Top players only',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'single_elimination',
   'upcoming',
   500.00,
   50000.00,
   8,
   0,
   NOW() + INTERVAL '30 days',
   NOW() + INTERVAL '32 days',
   '{"qualification_required": true, "min_rating": 900}'::jsonb),

  ('30000000-0000-0000-0000-000000000007',
   'Dubai Desert Challenge',
   'Extreme terrain crawler competition',
   '00000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000007',
   'round_robin',
   'registration',
   60.00,
   2500.00,
   12,
   6,
   NOW() + INTERVAL '5 days',
   NOW() + INTERVAL '6 days',
   '{"terrain": "desert", "temperature": "extreme"}'::jsonb),

  ('30000000-0000-0000-0000-000000000008',
   'Weekly Racing League #42',
   'Regular weekly racing tournament',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'swiss',
   'completed',
   25.00,
   1000.00,
   32,
   32,
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '2 days',
   '{"week": 42, "season": "winter"}'::jsonb),

  ('30000000-0000-0000-0000-000000000009',
   'Paris Combat Cup',
   'European combat championship',
   '00000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000009',
   'single_elimination',
   'upcoming',
   120.00,
   6000.00,
   16,
   9,
   NOW() + INTERVAL '14 days',
   NOW() + INTERVAL '15 days',
   '{"region": "EU", "points_for_ranking": 150}'::jsonb),

  ('30000000-0000-0000-0000-000000000010',
   'Beginners Cup',
   'Tournament for new players - Learn and win!',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   'round_robin',
   'registration',
   10.00,
   500.00,
   20,
   14,
   NOW() + INTERVAL '2 days',
   NOW() + INTERVAL '3 days',
   '{"beginner_friendly": true, "max_rating": 500}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. GAME SESSIONS (12 active/recent sessions)
-- ==========================================

INSERT INTO game_sessions (id, arena_id, player_id, status, game_mode, start_time, end_time, duration_seconds, score, entry_fee, prize_amount, control_latency_ms, metadata)
VALUES
  -- Active sessions (in_progress)
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'in_progress', 'time_trial', NOW() - INTERVAL '5 minutes', NULL, NULL, 0, 50.00, NULL, 45, '{"lap": 3, "best_time": "1:24.5"}'::jsonb),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'in_progress', 'prize_hunt', NOW() - INTERVAL '2 minutes', NULL, NULL, 120, 30.00, NULL, 78, '{"prizes_won": 0, "attempts": 4}'::jsonb),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'in_progress', 'combat', NOW() - INTERVAL '8 minutes', NULL, NULL, 450, 75.00, NULL, 52, '{"damage_dealt": 350, "damage_taken": 100}'::jsonb),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'in_progress', 'fpv_race', NOW() - INTERVAL '3 minutes', NULL, NULL, 0, 60.00, NULL, 38, '{"gates_passed": 12, "crashes": 1}'::jsonb),

  -- Recently completed (completed)
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'completed', 'time_trial', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', 600, 1850, 50.00, 125.00, 42, '{"final_time": "1:18.3", "rank": 1}'::jsonb),
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'completed', 'prize_hunt', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 55 minutes', 300, 250, 30.00, 80.00, 65, '{"prizes_won": 2, "total_value": 50}'::jsonb),
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'completed', 'combat', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 45 minutes', 900, 2200, 75.00, 200.00, 48, '{"ko": true, "time_remaining": 120}'::jsonb),
  ('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'completed', 'time_trial', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 50 minutes', 600, 1650, 50.00, 100.00, 55, '{"final_time": "1:22.7", "rank": 2}'::jsonb),
  ('40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000010', 'completed', 'prize_hunt', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 55 minutes', 300, 180, 30.00, 0.00, 88, '{"prizes_won": 1, "total_value": 15}'::jsonb),

  -- Waiting (waiting)
  ('40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'waiting', 'time_trial', NULL, NULL, NULL, 0, 50.00, NULL, NULL, '{"queue_position": 2}'::jsonb),
  ('40000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'waiting', 'prize_hunt', NULL, NULL, NULL, 0, 30.00, NULL, NULL, '{"queue_position": 1}'::jsonb),
  ('40000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'waiting', 'fpv_race', NULL, NULL, NULL, 0, 60.00, NULL, NULL, '{"queue_position": 3}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. ACHIEVEMENTS (8 achievements)
-- ==========================================

INSERT INTO achievements (id, name, description, icon, category, requirement_type, requirement_value, reward_pac, rarity, metadata)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'First Victory', 'Win your first game', '🏆', 'milestone', 'games_won', 1, 10.00, 'common',
   '{"tip": "Everyone starts somewhere!"}'::jsonb),
  ('50000000-0000-0000-0000-000000000002', 'Speed Demon', 'Complete a lap in under 60 seconds', '⚡', 'skill', 'best_lap_time', 60, 25.00, 'uncommon',
   '{"arena_type": "racing"}'::jsonb),
  ('50000000-0000-0000-0000-000000000003', 'Combat Master', 'Win 10 combat matches', '⚔️', 'milestone', 'combat_wins', 10, 50.00, 'rare',
   '{"arena_type": "combat"}'::jsonb),
  ('50000000-0000-0000-0000-000000000004', 'Prize Hunter', 'Win 50 prizes from claw machines', '🎁', 'milestone', 'prizes_won', 50, 30.00, 'uncommon',
   '{"arena_type": "arcade"}'::jsonb),
  ('50000000-0000-0000-0000-000000000005', 'Tournament Champion', 'Win any tournament', '👑', 'milestone', 'tournaments_won', 1, 100.00, 'epic',
   '{"tournament_required": true}'::jsonb),
  ('50000000-0000-0000-0000-000000000006', 'Early Bird', 'Play 10 games before 10 AM', '🌅', 'special', 'early_games', 10, 15.00, 'uncommon',
   '{"time_window": "00:00-10:00"}'::jsonb),
  ('50000000-0000-0000-0000-000000000007', 'Global Player', 'Play in arenas on 3 different continents', '🌍', 'exploration', 'continents_visited', 3, 40.00, 'rare',
   '{"travel_required": true}'::jsonb),
  ('50000000-0000-0000-0000-000000000008', 'Perfect Game', 'Complete a game with 100% accuracy', '💯', 'skill', 'accuracy', 100, 75.00, 'epic',
   '{"game_modes": ["time_trial", "prize_hunt"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. SYSTEM SETTINGS
-- ==========================================

INSERT INTO system_settings (key, value, value_type, description, is_public, is_editable)
VALUES
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false, true),
  ('min_bet_amount', '10', 'number', 'Minimum bet amount in PAC', true, true),
  ('max_bet_amount', '10000', 'number', 'Maximum bet amount in PAC', true, true),
  ('game_fee_percentage', '5', 'number', 'Platform fee percentage', true, false),
  ('max_concurrent_sessions', '1000', 'number', 'Max concurrent game sessions', false, true)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 10. FEATURE FLAGS
-- ==========================================

INSERT INTO feature_flags (name, is_enabled, description, metadata)
VALUES
  ('betting_enabled', true, 'Enable betting features', '{"min_version": "1.0.0"}'::jsonb),
  ('tournaments_enabled', true, 'Enable tournament features', '{"min_version": "1.0.0"}'::jsonb),
  ('nft_marketplace', false, 'Enable NFT marketplace (coming soon)', '{"min_version": "1.2.0", "eta": "Q2 2026"}'::jsonb),
  ('vr_mode', false, 'Enable VR mode for games', '{"min_version": "1.3.0", "eta": "Q3 2026"}'::jsonb),
  ('mobile_app', true, 'Enable mobile app features', '{"platforms": ["iOS", "Android"]}'::jsonb)
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- ==========================================
-- VERIFICATION QUERY
-- ==========================================

SELECT
  'Users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'Arenas', COUNT(*) FROM arenas
UNION ALL
SELECT 'Device Types', COUNT(*) FROM device_types
UNION ALL
SELECT 'Devices', COUNT(*) FROM devices
UNION ALL
SELECT 'Tournaments', COUNT(*) FROM tournaments
UNION ALL
SELECT 'Game Sessions', COUNT(*) FROM game_sessions
UNION ALL
SELECT 'Achievements', COUNT(*) FROM achievements
ORDER BY table_name;
