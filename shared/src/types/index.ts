// Shared TypeScript Types for GiperARENA

export interface User {
  id: string;
  username: string;
  email: string;
  wallet_address?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Arena {
  id: string;
  name: string;
  description: string;
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  price_per_minute: number;
  created_at: Date;
}

export interface GameSession {
  id: string;
  arena_id: string;
  player_id: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: Date;
  end_time?: Date;
  score?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
