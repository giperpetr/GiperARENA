-- Seed data for GiperARENA
-- Run with: psql -h api.gipergiraffe.com -p 5432 -U postgres.giper_prod -d postgres -f seed-via-psql.sql

-- Insert more arenas (we already have 5)
INSERT INTO giperarena.arenas (name, description, location, latitude, longitude, image_url, capacity, is_active, rating, total_games) VALUES
('Vladivostok Racing Circuit', 'Скоростная трасса для гоночных роботов', 'Владивосток, Россия', 43.1332, 131.9113, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 45, true, 4.4, 198),
('Krasnoyarsk Winter Arena', 'Всесезонная арена с климат-контролем', 'Красноярск, Россия', 56.0153, 92.8932, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', 55, true, 4.6, 342),
('Rostov Battle Arena', 'Арена для боевых роботов с усиленной защитой', 'Ростов-на-Дону, Россия', 47.2357, 39.7015, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', 65, true, 4.7, 512),
('Samara Tech Hub', 'Инновационная арена с VR трансляциями', 'Самара, Россия', 53.1959, 50.1002, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', 75, true, 4.8, 678),
('Ufa Robotics Center', 'Учебно-тренировочная арена для новичков', 'Уфа, Россия', 54.7388, 55.9721, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 30, true, 4.2, 145)
ON CONFLICT (name) DO NOTHING;

-- Insert tournaments
INSERT INTO giperarena.tournaments (title, description, start_date, end_date, prize_pool, max_participants, current_participants, entry_fee, status, arena_id, image_url, rules) VALUES
('Moscow Winter Championship 2025', 'Зимний чемпионат по робототехнике. Призовой фонд 1,000,000 ₽', NOW() + INTERVAL '7 days', NOW() + INTERVAL '9 days', 1000000, 64, 42, 5000, 'upcoming', 1, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'Стандартные правила FIRA'),
('St. Petersburg Drone Masters', 'Турнир для профессиональных пилотов дронов', NOW() + INTERVAL '14 days', NOW() + INTERVAL '16 days', 500000, 32, 18, 3000, 'upcoming', 2, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', 'FAI правила'),
('Kazan Battle Royale', 'Боевой турнир роботов - последний выживший', NOW() + INTERVAL '3 days', NOW() + INTERVAL '4 days', 750000, 48, 35, 4000, 'upcoming', 3, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', 'BattleBots формат'),
('Sochi Summer Cup', 'Летний кубок на открытом воздухе', NOW() + INTERVAL '21 days', NOW() + INTERVAL '23 days', 300000, 24, 12, 2000, 'upcoming', 4, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 'Outdoor специальные правила'),
('Novosibirsk Tech Challenge', 'Технический турнир с задачами на программирование', NOW() + INTERVAL '10 days', NOW() + INTERVAL '11 days', 400000, 40, 28, 3500, 'upcoming', 5, 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800', 'Технические задачи + бои')
ON CONFLICT (title) DO NOTHING;

-- Insert game sessions (recent completed games)
DO $$
DECLARE
    arena_id_var INT;
    i INT;
BEGIN
    FOR i IN 1..30 LOOP
        arena_id_var := (FLOOR(RANDOM() * 5) + 1)::INT;

        INSERT INTO giperarena.game_sessions (
            arena_id,
            status,
            start_time,
            end_time,
            duration_seconds,
            score
        ) VALUES (
            arena_id_var,
            'completed',
            NOW() - (i * INTERVAL '3 hours'),
            NOW() - (i * INTERVAL '3 hours') + (120 + FLOOR(RANDOM() * 300)) * INTERVAL '1 second',
            120 + FLOOR(RANDOM() * 300)::INT,
            FLOOR(RANDOM() * 1000)::INT
        );
    END LOOP;
END $$;

-- Display summary
SELECT 'Arenas:' as table_name, COUNT(*) as count FROM giperarena.arenas
UNION ALL
SELECT 'Tournaments:', COUNT(*) FROM giperarena.tournaments
UNION ALL
SELECT 'Game Sessions:', COUNT(*) FROM giperarena.game_sessions;
