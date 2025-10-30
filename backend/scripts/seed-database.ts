#!/usr/bin/env ts-node
/**
 * Database Seed Script
 *
 * Fills the database with realistic test data for:
 * - Arenas (10 different locations)
 * - Tournaments (upcoming, active, completed)
 * - Game Sessions (recent games with winners)
 * - Users (players and arena owners)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://api.gipergiraffe.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test users data
const testUsers = [
  { id: '00000000-0000-0000-0000-000000000001', username: 'alex_pilot', email: 'alex@test.com', avatar_url: 'https://i.pravatar.cc/150?img=1' },
  { id: '00000000-0000-0000-0000-000000000002', username: 'maria_racer', email: 'maria@test.com', avatar_url: 'https://i.pravatar.cc/150?img=2' },
  { id: '00000000-0000-0000-0000-000000000003', username: 'igor_pro', email: 'igor@test.com', avatar_url: 'https://i.pravatar.cc/150?img=3' },
  { id: '00000000-0000-0000-0000-000000000004', username: 'anna_speed', email: 'anna@test.com', avatar_url: 'https://i.pravatar.cc/150?img=4' },
  { id: '00000000-0000-0000-0000-000000000005', username: 'dmitry_king', email: 'dmitry@test.com', avatar_url: 'https://i.pravatar.cc/150?img=5' },
  { id: '00000000-0000-0000-0000-000000000006', username: 'olga_champion', email: 'olga@test.com', avatar_url: 'https://i.pravatar.cc/150?img=6' },
  { id: '00000000-0000-0000-0000-000000000007', username: 'sergey_master', email: 'sergey@test.com', avatar_url: 'https://i.pravatar.cc/150?img=7' },
  { id: '00000000-0000-0000-0000-000000000008', username: 'elena_ace', email: 'elena@test.com', avatar_url: 'https://i.pravatar.cc/150?img=8' },
];

// Arena owners (for arena creation)
const arenaOwners = [
  { id: '00000000-0000-0000-0000-000000000010', username: 'moscow_arena_admin', email: 'moscow@arenas.com' },
  { id: '00000000-0000-0000-0000-000000000011', username: 'spb_arena_admin', email: 'spb@arenas.com' },
  { id: '00000000-0000-0000-0000-000000000012', username: 'kazan_arena_admin', email: 'kazan@arenas.com' },
];

// Arenas data
const arenasData = [
  {
    name: 'Moscow Robotics Arena',
    description: 'Самая большая арена роботов в Москве с треком 50x30 метров',
    location: 'Москва, Россия',
    latitude: 55.7558,
    longitude: 37.6173,
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    capacity: 100,
    is_active: true,
    rating: 4.8,
    total_games: 1247,
    owner_id: '00000000-0000-0000-0000-000000000010',
  },
  {
    name: 'St. Petersburg Drone Stadium',
    description: 'Закрытая арена для дронов с профессиональным освещением',
    location: 'Санкт-Петербург, Россия',
    latitude: 59.9343,
    longitude: 30.3351,
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    capacity: 80,
    is_active: true,
    rating: 4.6,
    total_games: 892,
    owner_id: '00000000-0000-0000-0000-000000000011',
  },
  {
    name: 'Kazan Battle Zone',
    description: 'Outdoor арена с препятствиями для боевых роботов',
    location: 'Казань, Россия',
    latitude: 55.8304,
    longitude: 49.0661,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    capacity: 60,
    is_active: true,
    rating: 4.7,
    total_games: 634,
    owner_id: '00000000-0000-0000-0000-000000000012',
  },
  {
    name: 'Novosibirsk Tech Arena',
    description: 'Современная арена с AI системой судейства',
    location: 'Новосибирск, Россия',
    latitude: 55.0084,
    longitude: 82.9357,
    image_url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800',
    capacity: 50,
    is_active: true,
    rating: 4.5,
    total_games: 421,
    owner_id: '00000000-0000-0000-0000-000000000010',
  },
  {
    name: 'Yekaterinburg Robot Club',
    description: 'Уютная арена для начинающих пилотов',
    location: 'Екатеринбург, Россия',
    latitude: 56.8389,
    longitude: 60.6057,
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    capacity: 40,
    is_active: true,
    rating: 4.3,
    total_games: 287,
    owner_id: '00000000-0000-0000-0000-000000000011',
  },
  {
    name: 'Sochi Outdoor Arena',
    description: 'Арена на открытом воздухе с видом на море',
    location: 'Сочи, Россия',
    latitude: 43.6028,
    longitude: 39.7342,
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    capacity: 70,
    is_active: true,
    rating: 4.9,
    total_games: 156,
    owner_id: '00000000-0000-0000-0000-000000000012',
  },
  {
    name: 'Vladivostok Racing Circuit',
    description: 'Скоростная трасса для гоночных роботов',
    location: 'Владивосток, Россия',
    latitude: 43.1332,
    longitude: 131.9113,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    capacity: 45,
    is_active: true,
    rating: 4.4,
    total_games: 198,
    owner_id: '00000000-0000-0000-0000-000000000010',
  },
  {
    name: 'Krasnoyarsk Winter Arena',
    description: 'Всесезонная арена с климат-контролем',
    location: 'Красноярск, Россия',
    latitude: 56.0153,
    longitude: 92.8932,
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    capacity: 55,
    is_active: true,
    rating: 4.6,
    total_games: 342,
    owner_id: '00000000-0000-0000-0000-000000000011',
  },
  {
    name: 'Rostov Battle Arena',
    description: 'Арена для боевых роботов с усиленной защитой',
    location: 'Ростов-на-Дону, Россия',
    latitude: 47.2357,
    longitude: 39.7015,
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    capacity: 65,
    is_active: true,
    rating: 4.7,
    total_games: 512,
    owner_id: '00000000-0000-0000-0000-000000000012',
  },
  {
    name: 'Samara Tech Hub',
    description: 'Инновационная арена с VR трансляциями',
    location: 'Самара, Россия',
    latitude: 53.1959,
    longitude: 50.1002,
    image_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    capacity: 75,
    is_active: true,
    rating: 4.8,
    total_games: 678,
    owner_id: '00000000-0000-0000-0000-000000000010',
  },
];

// Tournaments data
const tournamentsData = [
  {
    title: 'Moscow Winter Championship 2025',
    description: 'Зимний чемпионат по робототехнике. Призовой фонд 1,000,000 ₽',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 1000000,
    max_participants: 64,
    current_participants: 42,
    entry_fee: 5000,
    status: 'upcoming',
    arena_id: 1, // Will be set after arenas are inserted
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    rules: 'Стандартные правила FIRA',
  },
  {
    title: 'St. Petersburg Drone Masters',
    description: 'Турнир для профессиональных пилотов дронов',
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 days
    end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 500000,
    max_participants: 32,
    current_participants: 18,
    entry_fee: 3000,
    status: 'upcoming',
    arena_id: 2,
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    rules: 'FAI правила',
  },
  {
    title: 'Kazan Battle Royale',
    description: 'Боевой турнир роботов последний выживший',
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 days
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 750000,
    max_participants: 48,
    current_participants: 35,
    entry_fee: 4000,
    status: 'upcoming',
    arena_id: 3,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    rules: 'BattleBots формат',
  },
  {
    title: 'Sochi Summer Cup',
    description: 'Летний кубок на открытом воздухе',
    start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // +21 days
    end_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 300000,
    max_participants: 24,
    current_participants: 12,
    entry_fee: 2000,
    status: 'upcoming',
    arena_id: 6,
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    rules: 'Outdoor специальные правила',
  },
];

// Game sessions data (recent completed games)
const generateGameSessions = (arenaIds: number[]) => {
  const sessions = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const arenaId = arenaIds[Math.floor(Math.random() * arenaIds.length)];
    const playerId = testUsers[Math.floor(Math.random() * testUsers.length)].id;
    const winnerId = Math.random() > 0.5 ? playerId : null;
    const startTime = new Date(now - (i + 1) * 3 * 60 * 60 * 1000); // Every 3 hours back
    const duration = 120 + Math.floor(Math.random() * 300); // 2-7 minutes

    sessions.push({
      arena_id: arenaId,
      player_id: playerId,
      status: 'completed',
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 1000).toISOString(),
      duration_seconds: duration,
      score: Math.floor(Math.random() * 1000),
      winner_id: winnerId,
    });
  }

  return sessions;
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Insert test users
    console.log('👥 Inserting test users...');
    const allUsers = [...testUsers, ...arenaOwners];
    for (const user of allUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });

      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Error inserting user ${user.username}:`, error.message);
      } else {
        console.log(`  ✅ User ${user.username} inserted`);
      }
    }

    // 2. Insert arenas
    console.log('\n🏟️  Inserting arenas...');
    const { data: insertedArenas, error: arenasError } = await supabase
      .from('arenas')
      .upsert(arenasData, { onConflict: 'name' })
      .select('id, name');

    if (arenasError) {
      console.error('  ❌ Error inserting arenas:', arenasError.message);
      throw arenasError;
    }

    console.log(`  ✅ ${insertedArenas?.length || 0} arenas inserted`);
    const arenaIds = insertedArenas?.map(a => a.id) || [];

    // 3. Insert tournaments
    console.log('\n🏆 Inserting tournaments...');
    const tournamentsWithArenas = tournamentsData.map((t, i) => ({
      ...t,
      arena_id: arenaIds[i % arenaIds.length],
    }));

    const { data: insertedTournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .upsert(tournamentsWithArenas, { onConflict: 'title' })
      .select('id, title');

    if (tournamentsError) {
      console.error('  ❌ Error inserting tournaments:', tournamentsError.message);
    } else {
      console.log(`  ✅ ${insertedTournaments?.length || 0} tournaments inserted`);
    }

    // 4. Insert game sessions
    console.log('\n🎮 Inserting game sessions...');
    const gameSessions = generateGameSessions(arenaIds);

    const { error: sessionsError } = await supabase
      .from('game_sessions')
      .insert(gameSessions);

    if (sessionsError) {
      console.error('  ❌ Error inserting game sessions:', sessionsError.message);
    } else {
      console.log(`  ✅ ${gameSessions.length} game sessions inserted`);
    }

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Users: ${allUsers.length}`);
    console.log(`  - Arenas: ${arenaIds.length}`);
    console.log(`  - Tournaments: ${tournamentsWithArenas.length}`);
    console.log(`  - Game Sessions: ${gameSessions.length}`);

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
