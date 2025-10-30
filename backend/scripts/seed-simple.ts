#!/usr/bin/env ts-node
/**
 * Simple Database Seed Script (without users)
 *
 * Seeds only public tables:
 * - Arenas
 * - Tournaments
 * - Game Sessions (with nullable user references)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://api.gipergiraffe.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    rating: '4.8',
    total_games: 1247,
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
    rating: '4.6',
    total_games: 892,
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
    rating: '4.7',
    total_games: 634,
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
    rating: '4.5',
    total_games: 421,
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
    rating: '4.3',
    total_games: 287,
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
    rating: '4.9',
    total_games: 156,
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
    rating: '4.4',
    total_games: 198,
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
    rating: '4.6',
    total_games: 342,
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
    rating: '4.7',
    total_games: 512,
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
    rating: '4.8',
    total_games: 678,
  },
];

// Tournaments data
const tournamentsData = [
  {
    title: 'Moscow Winter Championship 2025',
    description: 'Зимний чемпионат по робототехнике. Призовой фонд 1,000,000 ₽',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 1000000,
    max_participants: 64,
    current_participants: 42,
    entry_fee: 5000,
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    rules: 'Стандартные правила FIRA',
  },
  {
    title: 'St. Petersburg Drone Masters',
    description: 'Турнир для профессиональных пилотов дронов',
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 500000,
    max_participants: 32,
    current_participants: 18,
    entry_fee: 3000,
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    rules: 'FAI правила',
  },
  {
    title: 'Kazan Battle Royale',
    description: 'Боевой турнир роботов - последний выживший',
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 750000,
    max_participants: 48,
    current_participants: 35,
    entry_fee: 4000,
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    rules: 'BattleBots формат',
  },
  {
    title: 'Sochi Summer Cup',
    description: 'Летний кубок на открытом воздухе',
    start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 300000,
    max_participants: 24,
    current_participants: 12,
    entry_fee: 2000,
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    rules: 'Outdoor специальные правила',
  },
  {
    title: 'Novosibirsk Tech Challenge',
    description: 'Технический турнир с задачами на программирование',
    start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 400000,
    max_participants: 40,
    current_participants: 28,
    entry_fee: 3500,
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800',
    rules: 'Технические задачи + бои',
  },
];

// Game sessions (without user references)
const generateGameSessions = (arenaIds: number[]) => {
  const sessions = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const arenaId = arenaIds[Math.floor(Math.random() * arenaIds.length)];
    const startTime = new Date(now - (i + 1) * 3 * 60 * 60 * 1000);
    const duration = 120 + Math.floor(Math.random() * 300);

    sessions.push({
      arena_id: arenaId,
      status: 'completed',
      start_time: startTime.toISOString(),
      end_time: new Date(startTime.getTime() + duration * 1000).toISOString(),
      duration_seconds: duration,
      score: Math.floor(Math.random() * 1000),
    });
  }

  return sessions;
};

async function seedDatabase() {
  console.log('🌱 Starting simple database seed...\n');

  try {
    // 1. Insert arenas
    console.log('🏟️  Inserting arenas...');
    const { data: insertedArenas, error: arenasError } = await supabase
      .from('arenas')
      .insert(arenasData)
      .select('id, name');

    if (arenasError) {
      console.error('  ❌ Error inserting arenas:', arenasError.message);
      throw arenasError;
    }

    console.log(`  ✅ ${insertedArenas?.length || 0} arenas inserted`);
    const arenaIds = insertedArenas?.map(a => a.id) || [];

    // 2. Insert tournaments
    console.log('\n🏆 Inserting tournaments...');
    const tournamentsWithArenas = tournamentsData.map((t, i) => ({
      ...t,
      arena_id: arenaIds[i % arenaIds.length],
    }));

    const { data: insertedTournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .insert(tournamentsWithArenas)
      .select('id, title');

    if (tournamentsError) {
      console.error('  ❌ Error inserting tournaments:', tournamentsError.message);
    } else {
      console.log(`  ✅ ${insertedTournaments?.length || 0} tournaments inserted`);
    }

    // 3. Insert game sessions
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
    console.log(`  - Arenas: ${arenaIds.length}`);
    console.log(`  - Tournaments: ${tournamentsWithArenas.length}`);
    console.log(`  - Game Sessions: ${gameSessions.length}`);
    console.log('\n🌐 Check: https://giperarena.space');

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
