// Mock data for GiperARENA home page
// Realistic gaming portal data

export interface LiveGame {
  id: string;
  playerName: string;
  playerAvatar: string;
  viewerCount: number;
  gameType: string;
  arenaName: string;
  thumbnail: string;
  isLive: true;
  streamDuration: string;
}

export interface Tournament {
  id: string;
  rank: number;
  name: string;
  prizePool: number;
  playerCount: number;
  daysLeft: number;
  status: 'registration' | 'active' | 'finished';
  image: string;
  format: string;
}

export interface TopPlayer {
  rank: number;
  name: string;
  tier: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C';
  rating: number;
  wins: number;
  earnings: number;
  avatar: string;
  country: string;
}

export interface Arena {
  id: string;
  name: string;
  location: string;
  rating: number;
  playerCount: number;
  type: 'Robot Racing' | 'Claw Games' | 'Drone Racing' | 'Escape Room';
  images: string[];
  isVerified: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  timeAgo: string;
  views: number;
  comments: number;
  category: 'announcement' | 'update' | 'tournament' | 'arena';
}

export interface Highlight {
  id: string;
  title: string;
  category: 'epic' | 'funny' | 'skill' | 'fail';
  thumbnail: string;
  likes: number;
  duration: string;
  playerName: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  time: string;
  arena: string;
  prize: number;
  type: 'tournament' | 'special' | 'championship';
  playersRegistered: number;
}

// Mock Live Games (12 items)
export const MOCK_LIVE_GAMES: LiveGame[] = [
  {
    id: '1',
    playerName: 'Caedrel',
    playerAvatar: '👑',
    viewerCount: 17734,
    gameType: 'Robot Racing',
    arenaName: 'NYC Track Alpha',
    thumbnail: '🤖',
    isLive: true,
    streamDuration: '2:34:12',
  },
  {
    id: '2',
    playerName: 'summit1g',
    playerAvatar: '⚡',
    viewerCount: 9956,
    gameType: 'Claw Master',
    arenaName: 'Tokyo Arcade',
    thumbnail: '🎯',
    isLive: true,
    streamDuration: '1:45:33',
  },
  {
    id: '3',
    playerName: 'jasonw',
    playerAvatar: '🎮',
    viewerCount: 14823,
    gameType: 'Drone Race',
    arenaName: 'Dubai Sky Arena',
    thumbnail: '🚁',
    isLive: true,
    streamDuration: '0:52:17',
  },
  {
    id: '4',
    playerName: 'TheBurntPeanut',
    playerAvatar: '🔥',
    viewerCount: 8234,
    gameType: 'Escape Room',
    arenaName: 'London Mystery',
    thumbnail: '🔐',
    isLive: true,
    streamDuration: '3:12:45',
  },
  {
    id: '5',
    playerName: 'Lacy',
    playerAvatar: '💎',
    viewerCount: 6512,
    gameType: 'Robot Racing',
    arenaName: 'Berlin Speed Circuit',
    thumbnail: '🏎️',
    isLive: true,
    streamDuration: '1:23:56',
  },
  {
    id: '6',
    playerName: 'Voyboy',
    playerAvatar: '🌟',
    viewerCount: 5789,
    gameType: 'Claw Master',
    arenaName: 'Seoul Prize Center',
    thumbnail: '🎁',
    isLive: true,
    streamDuration: '0:34:22',
  },
  {
    id: '7',
    playerName: 'Shroud',
    playerAvatar: '🎯',
    viewerCount: 12456,
    gameType: 'Drone Race',
    arenaName: 'Singapore Sky Track',
    thumbnail: '🛸',
    isLive: true,
    streamDuration: '2:15:08',
  },
  {
    id: '8',
    playerName: 'xQc',
    playerAvatar: '🤡',
    viewerCount: 11234,
    gameType: 'Escape Room',
    arenaName: 'LA Horror House',
    thumbnail: '👻',
    isLive: true,
    streamDuration: '4:01:33',
  },
  {
    id: '9',
    playerName: 'Pokimane',
    playerAvatar: '🌸',
    viewerCount: 7891,
    gameType: 'Claw Master',
    arenaName: 'Paris Fashion Arcade',
    thumbnail: '👗',
    isLive: true,
    streamDuration: '1:12:45',
  },
  {
    id: '10',
    playerName: 'Ninja',
    playerAvatar: '🥷',
    viewerCount: 9123,
    gameType: 'Robot Racing',
    arenaName: 'Sydney Outback Track',
    thumbnail: '🦘',
    isLive: true,
    streamDuration: '0:45:11',
  },
  {
    id: '11',
    playerName: 'DrDisrespect',
    playerAvatar: '😎',
    viewerCount: 13567,
    gameType: 'Drone Race',
    arenaName: 'Vegas Neon Circuit',
    thumbnail: '🎰',
    isLive: true,
    streamDuration: '3:34:22',
  },
  {
    id: '12',
    playerName: 'Tfue',
    playerAvatar: '🏆',
    viewerCount: 6789,
    gameType: 'Escape Room',
    arenaName: 'Miami Beach Puzzle',
    thumbnail: '🏖️',
    isLive: true,
    streamDuration: '1:56:09',
  },
];

// Mock Tournaments (5 items)
export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    rank: 1,
    name: 'Robot Racing Championship',
    prizePool: 50000,
    playerCount: 256,
    daysLeft: 2,
    status: 'active',
    image: '🏎️',
    format: 'Single Elimination',
  },
  {
    id: '2',
    rank: 2,
    name: 'Claw Games Masters',
    prizePool: 25000,
    playerCount: 512,
    daysLeft: 5,
    status: 'registration',
    image: '🎯',
    format: 'Round Robin',
  },
  {
    id: '3',
    rank: 3,
    name: 'Drone Racing League',
    prizePool: 75000,
    playerCount: 128,
    daysLeft: 1,
    status: 'active',
    image: '🚁',
    format: 'Double Elimination',
  },
  {
    id: '4',
    rank: 4,
    name: 'Global Escape Challenge',
    prizePool: 35000,
    playerCount: 64,
    daysLeft: 7,
    status: 'registration',
    image: '🔐',
    format: 'Team Battle',
  },
  {
    id: '5',
    rank: 5,
    name: 'World Arena Finals',
    prizePool: 100000,
    playerCount: 32,
    daysLeft: 14,
    status: 'registration',
    image: '🌍',
    format: 'Swiss System',
  },
];

// Mock Top Players (50 items, showing top 10 on homepage)
export const MOCK_TOP_PLAYERS: TopPlayer[] = [
  { rank: 1, name: 'Caedrel', tier: 'S+', rating: 2847, wins: 1234, earnings: 124567, avatar: '👑', country: 'UK' },
  { rank: 2, name: 'summit1g', tier: 'S', rating: 2721, wins: 1087, earnings: 98234, avatar: '⚡', country: 'USA' },
  { rank: 3, name: 'jasonw', tier: 'S', rating: 2698, wins: 1045, earnings: 87654, avatar: '🎮', country: 'USA' },
  { rank: 4, name: 'TheBurntPeanut', tier: 'A+', rating: 2534, wins: 987, earnings: 76543, avatar: '🔥', country: 'CA' },
  { rank: 5, name: 'Lacy', tier: 'A+', rating: 2456, wins: 923, earnings: 65432, avatar: '💎', country: 'USA' },
  { rank: 6, name: 'Voyboy', tier: 'A+', rating: 2389, wins: 876, earnings: 58901, avatar: '🌟', country: 'USA' },
  { rank: 7, name: 'Shroud', tier: 'A', rating: 2312, wins: 834, earnings: 52345, avatar: '🎯', country: 'CA' },
  { rank: 8, name: 'xQc', tier: 'A', rating: 2278, wins: 798, earnings: 49876, avatar: '🤡', country: 'CA' },
  { rank: 9, name: 'Pokimane', tier: 'A', rating: 2234, wins: 765, earnings: 47123, avatar: '🌸', country: 'CA' },
  { rank: 10, name: 'Ninja', tier: 'A', rating: 2198, wins: 743, earnings: 45678, avatar: '🥷', country: 'USA' },
  // Additional 40 players (ranks 11-50) for full leaderboard page
  { rank: 11, name: 'DrDisrespect', tier: 'B+', rating: 2156, wins: 712, earnings: 43210, avatar: '😎', country: 'USA' },
  { rank: 12, name: 'Tfue', tier: 'B+', rating: 2123, wins: 689, earnings: 41234, avatar: '🏆', country: 'USA' },
  { rank: 13, name: 'Myth', tier: 'B+', rating: 2089, wins: 654, earnings: 39456, avatar: '🎭', country: 'USA' },
  { rank: 14, name: 'TimTheTatman', tier: 'B+', rating: 2045, wins: 623, earnings: 37890, avatar: '🎬', country: 'USA' },
  { rank: 15, name: 'Sykkuno', tier: 'B', rating: 2012, wins: 598, earnings: 36123, avatar: '🌙', country: 'USA' },
  { rank: 16, name: 'Valkyrae', tier: 'B', rating: 1987, wins: 576, earnings: 34567, avatar: '💜', country: 'USA' },
  { rank: 17, name: 'Corpse', tier: 'B', rating: 1956, wins: 554, earnings: 33012, avatar: '💀', country: 'USA' },
  { rank: 18, name: 'Ludwig', tier: 'B', rating: 1923, wins: 532, earnings: 31456, avatar: '🎵', country: 'USA' },
  { rank: 19, name: 'Hasan', tier: 'B', rating: 1891, wins: 511, earnings: 29890, avatar: '📺', country: 'USA' },
  { rank: 20, name: 'Mizkif', tier: 'B', rating: 1867, wins: 493, earnings: 28345, avatar: '🎪', country: 'USA' },
  { rank: 21, name: 'Asmongold', tier: 'C', rating: 1834, wins: 476, earnings: 26890, avatar: '⚔️', country: 'USA' },
  { rank: 22, name: 'Sodapoppin', tier: 'C', rating: 1812, wins: 461, earnings: 25456, avatar: '🥤', country: 'USA' },
  { rank: 23, name: 'Lirik', tier: 'C', rating: 1789, wins: 447, earnings: 24123, avatar: '👾', country: 'USA' },
  { rank: 24, name: 'Moonmoon', tier: 'C', rating: 1767, wins: 434, earnings: 22890, avatar: '🌜', country: 'USA' },
  { rank: 25, name: 'Trainwrecks', tier: 'C', rating: 1745, wins: 422, earnings: 21678, avatar: '🚂', country: 'USA' },
  { rank: 26, name: 'Greek', tier: 'C', rating: 1723, wins: 411, earnings: 20567, avatar: '🏛️', country: 'UK' },
  { rank: 27, name: 'Forsen', tier: 'C', rating: 1701, wins: 401, earnings: 19456, avatar: '🐴', country: 'SE' },
  { rank: 28, name: 'Elajjaz', tier: 'C', rating: 1679, wins: 391, earnings: 18345, avatar: '🎮', country: 'SE' },
  { rank: 29, name: 'Cohh', tier: 'C', rating: 1658, wins: 382, earnings: 17234, avatar: '🎩', country: 'USA' },
  { rank: 30, name: 'Sacriel', tier: 'C', rating: 1637, wins: 373, earnings: 16123, avatar: '🛡️', country: 'UK' },
  { rank: 31, name: 'Lirik2', tier: 'C', rating: 1616, wins: 365, earnings: 15012, avatar: '👻', country: 'USA' },
  { rank: 32, name: 'Summit2g', tier: 'C', rating: 1595, wins: 357, earnings: 13901, avatar: '⚡', country: 'USA' },
  { rank: 33, name: 'Shroud2', tier: 'C', rating: 1574, wins: 349, earnings: 12790, avatar: '🎯', country: 'CA' },
  { rank: 34, name: 'DrLupo', tier: 'C', rating: 1553, wins: 341, earnings: 11679, avatar: '🐺', country: 'USA' },
  { rank: 35, name: 'Dakotaz', tier: 'C', rating: 1532, wins: 333, earnings: 10568, avatar: '🦅', country: 'USA' },
  { rank: 36, name: 'Nickmercs', tier: 'C', rating: 1511, wins: 325, earnings: 9457, avatar: '💪', country: 'USA' },
  { rank: 37, name: 'Cloakzy', tier: 'C', rating: 1490, wins: 317, earnings: 8346, avatar: '🎯', country: 'USA' },
  { rank: 38, name: 'Sypherpk', tier: 'C', rating: 1469, wins: 309, earnings: 7235, avatar: '🦊', country: 'USA' },
  { rank: 39, name: 'Chap', tier: 'C', rating: 1448, wins: 301, earnings: 6124, avatar: '🎨', country: 'USA' },
  { rank: 40, name: 'Poach', tier: 'C', rating: 1427, wins: 293, earnings: 5013, avatar: '🥚', country: 'USA' },
  { rank: 41, name: 'Vivid', tier: 'C', rating: 1406, wins: 285, earnings: 4902, avatar: '🌈', country: 'USA' },
  { rank: 42, name: 'Reverse', tier: 'C', rating: 1385, wins: 277, earnings: 4791, avatar: '🔄', country: 'USA' },
  { rank: 43, name: 'Aydan', tier: 'C', rating: 1364, wins: 269, earnings: 4680, avatar: '🎯', country: 'USA' },
  { rank: 44, name: 'Rated', tier: 'C', rating: 1343, wins: 261, earnings: 4569, avatar: '⭐', country: 'UK' },
  { rank: 45, name: 'Thinnd', tier: 'C', rating: 1322, wins: 253, earnings: 4458, avatar: '🎬', country: 'USA' },
  { rank: 46, name: 'Nadeshot', tier: 'C', rating: 1301, wins: 245, earnings: 4347, avatar: '🎮', country: 'USA' },
  { rank: 47, name: 'Courage', tier: 'C', rating: 1280, wins: 237, earnings: 4236, avatar: '🦁', country: 'USA' },
  { rank: 48, name: 'Typical', tier: 'C', rating: 1259, wins: 229, earnings: 4125, avatar: '🎪', country: 'USA' },
  { rank: 49, name: 'Wildcat', tier: 'C', rating: 1238, wins: 221, earnings: 4014, avatar: '🐱', country: 'USA' },
  { rank: 50, name: 'BasicallyIDoWrk', tier: 'C', rating: 1217, wins: 213, earnings: 3903, avatar: '🎭', country: 'USA' },
];

// Mock Arenas (12 items, showing top 6 on homepage)
export const MOCK_ARENAS: Arena[] = [
  {
    id: '1',
    name: 'Robot Track NYC',
    location: 'New York, USA',
    rating: 4.9,
    playerCount: 2345,
    type: 'Robot Racing',
    images: ['🏙️', '🤖', '🏎️'],
    isVerified: true,
  },
  {
    id: '2',
    name: 'Claw Master Tokyo',
    location: 'Tokyo, Japan',
    rating: 4.8,
    playerCount: 1834,
    type: 'Claw Games',
    images: ['🗼', '🎯', '🎁'],
    isVerified: true,
  },
  {
    id: '3',
    name: 'Drone Sky Dubai',
    location: 'Dubai, UAE',
    rating: 4.7,
    playerCount: 1567,
    type: 'Drone Racing',
    images: ['🏰', '🚁', '🛸'],
    isVerified: true,
  },
  {
    id: '4',
    name: 'London Mystery Escape',
    location: 'London, UK',
    rating: 4.9,
    playerCount: 1423,
    type: 'Escape Room',
    images: ['🏰', '🔐', '🗝️'],
    isVerified: true,
  },
  {
    id: '5',
    name: 'Berlin Speed Circuit',
    location: 'Berlin, Germany',
    rating: 4.6,
    playerCount: 1289,
    type: 'Robot Racing',
    images: ['🏛️', '🏎️', '⚙️'],
    isVerified: true,
  },
  {
    id: '6',
    name: 'Seoul Prize Center',
    location: 'Seoul, South Korea',
    rating: 4.8,
    playerCount: 1156,
    type: 'Claw Games',
    images: ['🏯', '🎁', '💎'],
    isVerified: true,
  },
  {
    id: '7',
    name: 'Singapore Sky Track',
    location: 'Singapore',
    rating: 4.7,
    playerCount: 1089,
    type: 'Drone Racing',
    images: ['🏙️', '🛸', '🌃'],
    isVerified: true,
  },
  {
    id: '8',
    name: 'LA Horror House',
    location: 'Los Angeles, USA',
    rating: 4.9,
    playerCount: 1034,
    type: 'Escape Room',
    images: ['🎬', '👻', '🔦'],
    isVerified: true,
  },
  {
    id: '9',
    name: 'Paris Fashion Arcade',
    location: 'Paris, France',
    rating: 4.6,
    playerCount: 989,
    type: 'Claw Games',
    images: ['🗼', '👗', '💄'],
    isVerified: false,
  },
  {
    id: '10',
    name: 'Sydney Outback Track',
    location: 'Sydney, Australia',
    rating: 4.7,
    playerCount: 923,
    type: 'Robot Racing',
    images: ['🦘', '🏎️', '🌏'],
    isVerified: true,
  },
  {
    id: '11',
    name: 'Vegas Neon Circuit',
    location: 'Las Vegas, USA',
    rating: 4.8,
    playerCount: 876,
    type: 'Drone Racing',
    images: ['🎰', '🛸', '💡'],
    isVerified: true,
  },
  {
    id: '12',
    name: 'Miami Beach Puzzle',
    location: 'Miami, USA',
    rating: 4.5,
    playerCount: 834,
    type: 'Escape Room',
    images: ['🏖️', '🔐', '🌴'],
    isVerified: false,
  },
];

// Mock News (10 items, showing 5 on homepage)
export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'NEW ARENA OPENING: Tokyo Mega Complex',
    subtitle: '🔥 5 NEW ROBOT TRACKS | 50% LAUNCH BONUS',
    image: '🗼',
    timeAgo: '2 hours ago',
    views: 3245,
    comments: 234,
    category: 'arena',
  },
  {
    id: '2',
    title: 'SEASON 3 CHAMPIONSHIP ANNOUNCED',
    subtitle: '$500K PRIZE POOL | REGISTRATION OPEN',
    image: '🏆',
    timeAgo: '1 day ago',
    views: 12567,
    comments: 1234,
    category: 'tournament',
  },
  {
    id: '3',
    title: 'PLATFORM UPDATE: VR SUPPORT NOW LIVE',
    subtitle: 'IMMERSIVE GAMEPLAY NOW AVAILABLE',
    image: '🥽',
    timeAgo: '3 days ago',
    views: 8934,
    comments: 567,
    category: 'update',
  },
  {
    id: '4',
    title: 'NEW DRONE RACING LEAGUE STARTS FRIDAY',
    subtitle: '$75K PRIZE | 128 TEAMS COMPETING',
    image: '🚁',
    timeAgo: '5 days ago',
    views: 6789,
    comments: 432,
    category: 'tournament',
  },
  {
    id: '5',
    title: 'DUBAI ARENA BREAKS PLAYER RECORD',
    subtitle: '10,000 PLAYERS IN ONE DAY!',
    image: '🏰',
    timeAgo: '1 week ago',
    views: 5432,
    comments: 321,
    category: 'announcement',
  },
  {
    id: '6',
    title: 'TOP 10 PLAYERS REVEALED FOR WORLD FINALS',
    subtitle: 'WHO WILL WIN THE $100K GRAND PRIZE?',
    image: '👑',
    timeAgo: '1 week ago',
    views: 9876,
    comments: 678,
    category: 'announcement',
  },
  {
    id: '7',
    title: 'NEW ESCAPE ROOM CATEGORY ADDED',
    subtitle: 'HORROR, MYSTERY, AND ADVENTURE MODES',
    image: '🔐',
    timeAgo: '2 weeks ago',
    views: 4321,
    comments: 234,
    category: 'update',
  },
  {
    id: '8',
    title: 'CLAW MASTER TOURNAMENT WINNERS',
    subtitle: '512 PLAYERS COMPETED FOR $25K',
    image: '🎯',
    timeAgo: '2 weeks ago',
    views: 7654,
    comments: 543,
    category: 'tournament',
  },
  {
    id: '9',
    title: 'NEW YORK ARENA MAINTENANCE COMPLETE',
    subtitle: '3 NEW TRACKS ADDED TO NYC COMPLEX',
    image: '🏙️',
    timeAgo: '3 weeks ago',
    views: 3456,
    comments: 198,
    category: 'arena',
  },
  {
    id: '10',
    title: 'MOBILE APP BETA TESTING BEGINS',
    subtitle: 'PLAY ON THE GO WITH IOS & ANDROID',
    image: '📱',
    timeAgo: '1 month ago',
    views: 6543,
    comments: 456,
    category: 'update',
  },
];

// Mock Community Highlights (20 items, showing 8 on homepage)
export const MOCK_HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    title: 'IMPOSSIBLE COMEBACK WIN',
    category: 'epic',
    thumbnail: '🔥',
    likes: 45234,
    duration: '2:45',
    playerName: 'Caedrel',
  },
  {
    id: '2',
    title: 'FUNNIEST FAIL EVER',
    category: 'funny',
    thumbnail: '😂',
    likes: 32156,
    duration: '1:23',
    playerName: 'xQc',
  },
  {
    id: '3',
    title: 'INSANE SKILL SHOT',
    category: 'skill',
    thumbnail: '🎯',
    likes: 28934,
    duration: '0:47',
    playerName: 'Shroud',
  },
  {
    id: '4',
    title: 'EPIC FAIL COMPILATION',
    category: 'fail',
    thumbnail: '💥',
    likes: 21345,
    duration: '1:56',
    playerName: 'summit1g',
  },
  {
    id: '5',
    title: '360 NO SCOPE DRONE SHOT',
    category: 'skill',
    thumbnail: '🚁',
    likes: 19876,
    duration: '0:34',
    playerName: 'jasonw',
  },
  {
    id: '6',
    title: 'WHEN LUCK GOES YOUR WAY',
    category: 'funny',
    thumbnail: '🍀',
    likes: 17654,
    duration: '1:12',
    playerName: 'Ninja',
  },
  {
    id: '7',
    title: 'PERFECT RUN WORLD RECORD',
    category: 'epic',
    thumbnail: '⚡',
    likes: 25432,
    duration: '3:21',
    playerName: 'DrDisrespect',
  },
  {
    id: '8',
    title: 'WORST TIMING EVER',
    category: 'fail',
    thumbnail: '⏰',
    likes: 15678,
    duration: '0:56',
    playerName: 'Tfue',
  },
  {
    id: '9',
    title: 'CLUTCH 1V5 VICTORY',
    category: 'epic',
    thumbnail: '💪',
    likes: 22345,
    duration: '4:12',
    playerName: 'Pokimane',
  },
  {
    id: '10',
    title: 'COMEDY GOLD MOMENT',
    category: 'funny',
    thumbnail: '🎭',
    likes: 18932,
    duration: '2:03',
    playerName: 'Ludwig',
  },
  {
    id: '11',
    title: 'FRAME PERFECT DODGE',
    category: 'skill',
    thumbnail: '🎮',
    likes: 16543,
    duration: '0:23',
    playerName: 'Voyboy',
  },
  {
    id: '12',
    title: 'BIGGEST CHOKE IN HISTORY',
    category: 'fail',
    thumbnail: '😱',
    likes: 14321,
    duration: '1:45',
    playerName: 'Mizkif',
  },
  {
    id: '13',
    title: 'INCREDIBLE COMEBACK',
    category: 'epic',
    thumbnail: '🏆',
    likes: 23456,
    duration: '5:34',
    playerName: 'TheBurntPeanut',
  },
  {
    id: '14',
    title: 'ACCIDENTAL GENIUS',
    category: 'funny',
    thumbnail: '🤯',
    likes: 19234,
    duration: '1:34',
    playerName: 'Lacy',
  },
  {
    id: '15',
    title: 'PERFECT REACTION TIME',
    category: 'skill',
    thumbnail: '⏱️',
    likes: 17890,
    duration: '0:41',
    playerName: 'Corpse',
  },
  {
    id: '16',
    title: 'WHEN YOU FORGET TO JUMP',
    category: 'fail',
    thumbnail: '🤦',
    likes: 13456,
    duration: '0:28',
    playerName: 'Sykkuno',
  },
  {
    id: '17',
    title: 'LEGENDARY OUTPLAY',
    category: 'epic',
    thumbnail: '👑',
    likes: 21098,
    duration: '3:45',
    playerName: 'Valkyrae',
  },
  {
    id: '18',
    title: 'TROLLING GONE WRONG',
    category: 'funny',
    thumbnail: '😈',
    likes: 16789,
    duration: '2:12',
    playerName: 'Hasan',
  },
  {
    id: '19',
    title: 'IMPOSSIBLE SHOT LANDED',
    category: 'skill',
    thumbnail: '🎯',
    likes: 15432,
    duration: '0:52',
    playerName: 'Asmongold',
  },
  {
    id: '20',
    title: 'KARMA STRIKES BACK',
    category: 'fail',
    thumbnail: '⚖️',
    likes: 12345,
    duration: '1:18',
    playerName: 'Sodapoppin',
  },
];

// Mock Upcoming Events (10 items, showing 4 on homepage)
export const MOCK_EVENTS: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Robot Racing Qualifiers - Round 1',
    time: 'TODAY 18:00 UTC',
    arena: 'NYC Arena',
    prize: 10000,
    type: 'tournament',
    playersRegistered: 234,
  },
  {
    id: '2',
    title: 'Claw Games Masters - Finals',
    time: 'TOMORROW 20:00 UTC',
    arena: 'Tokyo Arena',
    prize: 25000,
    type: 'championship',
    playersRegistered: 64,
  },
  {
    id: '3',
    title: 'Drone Racing League - Season Finale',
    time: 'FRIDAY 19:00 UTC',
    arena: 'Dubai Arena',
    prize: 75000,
    type: 'championship',
    playersRegistered: 32,
  },
  {
    id: '4',
    title: 'Escape Room Challenge - Horror Night',
    time: 'SATURDAY 22:00 UTC',
    arena: 'London Arena',
    prize: 5000,
    type: 'special',
    playersRegistered: 128,
  },
  {
    id: '5',
    title: 'World Championship - Semifinals',
    time: 'NEXT MONDAY 16:00 UTC',
    arena: 'Multiple Arenas',
    prize: 100000,
    type: 'championship',
    playersRegistered: 16,
  },
  {
    id: '6',
    title: 'Community Tournament - Open Entry',
    time: 'NEXT TUESDAY 19:00 UTC',
    arena: 'Berlin Arena',
    prize: 15000,
    type: 'tournament',
    playersRegistered: 456,
  },
  {
    id: '7',
    title: 'Drone Speed Challenge',
    time: 'NEXT WEDNESDAY 18:30 UTC',
    arena: 'Singapore Arena',
    prize: 8000,
    type: 'special',
    playersRegistered: 89,
  },
  {
    id: '8',
    title: 'Claw Master Regional Finals',
    time: 'NEXT THURSDAY 21:00 UTC',
    arena: 'Seoul Arena',
    prize: 20000,
    type: 'tournament',
    playersRegistered: 128,
  },
  {
    id: '9',
    title: 'VR Escape Room Beta Test',
    time: 'NEXT FRIDAY 17:00 UTC',
    arena: 'LA Arena',
    prize: 3000,
    type: 'special',
    playersRegistered: 256,
  },
  {
    id: '10',
    title: 'Grand Finals - All Categories',
    time: 'NEXT SATURDAY 20:00 UTC',
    arena: 'Vegas Arena',
    prize: 150000,
    type: 'championship',
    playersRegistered: 32,
  },
];

// Live Stats (for floating widget)
export interface LiveStats {
  playersOnline: number;
  gamesActive: number;
  tournamentsLive: number;
  totalPrizePool: number;
  totalViewers: number;
}

export const MOCK_LIVE_STATS: LiveStats = {
  playersOnline: 3247,
  gamesActive: 1247,
  tournamentsLive: 47,
  totalPrizePool: 2500000,
  totalViewers: 47234,
};
