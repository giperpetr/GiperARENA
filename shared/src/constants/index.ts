// Shared Constants for GiperARENA

export const API_VERSION = 'v1';
export const APP_NAME = 'GiperARENA';

export const GAME_SESSION_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ARENA_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
} as const;
