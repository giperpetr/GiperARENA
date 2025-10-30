// API Client for GiperARENA - connects to backend REST API and Supabase
import type { Arena, GameSession, Tournament, User, Wallet, Device, MediaFile } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.giperarena.space/api/v1';

/**
 * API Client class with authentication support
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Lazy import supabase to avoid initialization during build
   */
  private async getSupabase() {
    const { supabase } = await import('./supabase');
    return supabase;
  }

  /**
   * Get authorization header with current user token
   */
  private async getAuthHeader(): Promise<{ Authorization?: string }> {
    const supabase = await this.getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }

    return {};
  }

  /**
   * Make HTTP request with auth
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // ==========================================
  // USERS
  // ==========================================

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(updates: any) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUserStats(userId: string) {
    return this.request(`/users/${userId}/stats`);
  }

  // ==========================================
  // ARENAS
  // ==========================================

  async getArenas(filters?: {
    status?: string;
    arena_type?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.arena_type) params.append('arena_type', filters.arena_type);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response: any = await this.request(`/arenas?${params}`);
    return response.data || response;
  }

  async getArenaById(arenaId: string): Promise<Arena> {
    return this.request<Arena>(`/arenas/${arenaId}`);
  }

  async getArenaBySlug(slug: string) {
    return this.request(`/arenas/slug/${slug}`);
  }

  async getArenaDevices(arenaId: string) {
    return this.request(`/arenas/${arenaId}/devices`);
  }

  // ==========================================
  // GAME SESSIONS
  // ==========================================

  async createGameSession(data: {
    arena_id: string;
    device_id: string;
    game_mode: string;
  }) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessionById(sessionId: string) {
    return this.request(`/sessions/${sessionId}`);
  }

  async endGameSession(sessionId: string) {
    return this.request(`/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  async getUserSessions(userId: string) {
    return this.request(`/sessions/user/${userId}`);
  }

  async getGameSessions(filters?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    arena_id?: string;
    player_id?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.arena_id) params.append('arena_id', filters.arena_id);
    if (filters?.player_id) params.append('player_id', filters.player_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response: any = await this.request(`/sessions?${params}`);
    return response.data || response;
  }

  // ==========================================
  // TOURNAMENTS
  // ==========================================

  async getTournaments(filters?: {
    status?: string;
    arena_id?: string;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/tournaments?${params}`);
  }

  async getTournamentById(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}`);
  }

  async joinTournament(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
    });
  }

  async getTournamentLeaderboard(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/leaderboard`);
  }

  // ==========================================
  // WALLETS & TOKENS
  // ==========================================

  async getWallet(userId: string) {
    return this.request(`/wallets/${userId}`);
  }

  async getTransactions(userId: string, filters?: {
    transaction_type?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/wallets/${userId}/transactions?${params}`);
  }

  // ==========================================
  // BETS
  // ==========================================

  async placeBet(data: {
    session_id: string;
    bet_type: string;
    amount: number;
    odds: number;
  }) {
    return this.request('/bets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserBets(userId: string) {
    return this.request(`/bets/user/${userId}`);
  }

  // ==========================================
  // NFTs
  // ==========================================

  async getUserNFTs(userId: string) {
    return this.request(`/nfts/user/${userId}`);
  }

  async getNFTById(nftId: string) {
    return this.request(`/nfts/${nftId}`);
  }

  async listNFT(nftId: string, price: number) {
    return this.request(`/nfts/${nftId}/list`, {
      method: 'POST',
      body: JSON.stringify({ price }),
    });
  }

  async buyNFT(nftId: string) {
    return this.request(`/nfts/${nftId}/buy`, {
      method: 'POST',
    });
  }

  // ==========================================
  // MEDIA FILES
  // ==========================================

  async uploadFile(
    file: File,
    options: {
      file_type: 'avatar' | 'video' | 'replay' | 'document' | 'image' | 'thumbnail' | 'banner';
      entity_type: 'user' | 'arena' | 'session' | 'tournament' | 'device';
      entity_id: string;
      metadata?: any;
    }
  ) {
    const authHeader = await this.getAuthHeader();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', options.file_type);
    formData.append('entity_type', options.entity_type);
    formData.append('entity_id', options.entity_id);

    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const response = await fetch(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      headers: {
        ...authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Upload failed',
        message: response.statusText,
      }));
      throw new Error(error.message || 'File upload failed');
    }

    return response.json();
  }

  async getFileUrl(fileId: string, expiresIn: number = 3600) {
    return this.request(`/media/${fileId}/url?expiresIn=${expiresIn}`);
  }

  async getEntityFiles(
    entityType: string,
    entityId: string,
    fileType?: string
  ) {
    const params = fileType ? `?fileType=${fileType}` : '';
    return this.request(`/media/entity/${entityType}/${entityId}${params}`);
  }

  async deleteFile(fileId: string) {
    return this.request(`/media/${fileId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // DEVICES
  // ==========================================

  async getDeviceById(deviceId: string) {
    return this.request(`/devices/${deviceId}`);
  }

  async getArenaDevicesApi(arenaId: string, filters?: {
    status?: string;
    device_type_id?: string;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request(`/devices/arena/${arenaId}?${params}`);
  }

  async getAvailableDevices(arenaId: string) {
    return this.request(`/devices/arena/${arenaId}/available`);
  }

  async getDeviceStats(deviceId: string) {
    return this.request(`/devices/${deviceId}/stats`);
  }
}

// Export singleton instance
export const api = new ApiClient();

export default api;
