// GiperARENA Frontend Types
// Based on actual database schema

export interface User {
  id: string;
  username: string;
  email: string;
  wallet_address?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Arena {
  id: string;
  name: string;
  description?: string;
  operator_id: string;
  location_address?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'maintenance' | 'pending' | 'inactive';
  arena_type: string;
  price_per_minute: number;
  currency: string;
  max_players: number;
  operating_hours?: Record<string, any>;
  features?: string[];
  equipment?: string[];
  media_urls?: {
    images: string[];
    videos: string[];
  };
  rating: number;
  total_games: number;
  total_revenue: number;
  is_verified: boolean;
  metadata: {
    features?: string[];
    devices?: any[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  arena_id: string;
  device_type_id: string;
  name: string;
  serial_number: string;
  status: 'online' | 'offline' | 'in_use' | 'maintenance';
  battery_level?: number;
  last_heartbeat?: string;
  control_endpoint?: string;
  raspberry_pi_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeviceType {
  id: string;
  name: string;
  category: 'robot' | 'drone' | 'crawler' | 'vehicle' | 'other';
  description?: string;
  icon_url?: string;
  specifications: Record<string, any>;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  organizer_id: string;
  arena_id?: string;
  tournament_type?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  status: 'upcoming' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  entry_fee?: number;
  prize_pool?: number;
  prize_distribution?: Record<string, any>;
  max_participants?: number;
  current_participants: number;
  start_date?: string;
  end_date?: string;
  rules?: Record<string, any>;
  bracket?: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  arena_id: string;
  player_id: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'error';
  game_mode?: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  score: number;
  achievements?: Record<string, any>[];
  replay_url?: string;
  entry_fee?: number;
  prize_amount?: number;
  transaction_hash?: string;
  control_latency_ms?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  slug: string;
  description?: string;
  achievement_category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  pac_reward: number;
  gac_reward: number;
  requirements: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  gac_balance: number;
  pac_balance: number;
  staked_gac: number;
  staking_tier?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  file_type: 'avatar' | 'video' | 'replay' | 'document' | 'image' | 'thumbnail' | 'banner';
  entity_type: 'user' | 'arena' | 'session' | 'tournament' | 'device';
  entity_id: string;
  bucket: string;
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail_path?: string;
  metadata: Record<string, any>;
  uploaded_by: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter types
export interface ArenaFilters {
  status?: Arena['status'];
  arena_type?: string;
  min_rating?: number;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}

export interface TournamentFilters {
  status?: Tournament['status'];
  tournament_type?: Tournament['tournament_type'];
  arena_id?: string;
  limit?: number;
  offset?: number;
}

export interface GameSessionFilters {
  arena_id?: string;
  player_id?: string;
  status?: GameSession['status'];
  limit?: number;
  offset?: number;
}
