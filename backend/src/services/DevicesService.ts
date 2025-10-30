// Devices Service - Business logic for device/robot/drone management
import { supabaseAdmin } from '../config/supabase';
import redis from '../config/redis';

export interface Device {
  id?: string;
  arena_id: string;
  device_type_id: string;
  name: string;
  serial_number: string;
  status?: 'online' | 'offline' | 'in_use' | 'maintenance' | 'broken';
  raspberry_pi_id?: string;
  ip_address?: string;
  firmware_version?: string;
  battery_level?: number;
  last_heartbeat?: Date;
  capabilities?: any;
  maintenance_schedule?: any;
  total_sessions?: number;
  total_uptime_hours?: number;
  is_active?: boolean;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface DeviceType {
  id?: string;
  name: string;
  category: 'robot' | 'drone' | 'vehicle' | 'crawler' | 'other';
  description?: string;
  specifications?: any;
  default_capabilities?: any;
  image_url?: string;
  is_active?: boolean;
}

export interface DeviceHeartbeat {
  device_id: string;
  raspberry_pi_id: string;
  status: Device['status'];
  battery_level?: number;
  ip_address?: string;
  firmware_version?: string;
  metadata?: any;
}

export class DevicesService {
  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string): Promise<Device | null> {
    const cacheKey = `device:${deviceId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('devices')
      .select(`
        *,
        arena:arenas(id, name, slug),
        device_type:device_types(id, name, category)
      `)
      .eq('id', deviceId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Cache for 5 minutes
    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data;
  }

  /**
   * Get all devices for an arena
   */
  async getArenaDevices(
    arenaId: string,
    filters?: {
      status?: Device['status'];
      device_type_id?: string;
    }
  ): Promise<Device[]> {
    const cacheKey = `arena_devices:${arenaId}:${JSON.stringify(filters || {})}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    let query = supabaseAdmin
      .from('devices')
      .select(`
        *,
        device_type:device_types(id, name, category, image_url)
      `)
      .eq('arena_id', arenaId)
      .eq('is_active', true)
      .order('name');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.device_type_id) {
      query = query.eq('device_type_id', filters.device_type_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Cache for 2 minutes
    if (data) {
      await redis.setex(cacheKey, 120, JSON.stringify(data));
    }

    return data || [];
  }

  /**
   * Get available devices (online and not in use)
   */
  async getAvailableDevices(arenaId: string): Promise<Device[]> {
    const cacheKey = `available_devices:${arenaId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('devices')
      .select(`
        *,
        device_type:device_types(id, name, category, image_url)
      `)
      .eq('arena_id', arenaId)
      .eq('status', 'online')
      .eq('is_active', true)
      .gte('battery_level', 20) // At least 20% battery
      .order('name');

    if (error) throw error;

    // Cache for 30 seconds (devices status changes frequently)
    if (data) {
      await redis.setex(cacheKey, 30, JSON.stringify(data));
    }

    return data || [];
  }

  /**
   * Register new device
   */
  async registerDevice(device: Device): Promise<Device> {
    const { data, error } = await supabaseAdmin
      .from('devices')
      .insert(device)
      .select()
      .single();

    if (error) throw error;

    // Invalidate arena devices cache
    await this.invalidateArenaCache(device.arena_id);

    return data;
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(
    deviceId: string,
    status: Device['status']
  ): Promise<Device> {
    const { data, error } = await supabaseAdmin
      .from('devices')
      .update({ status, updated_at: new Date() })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`device:${deviceId}`);
    if (data) {
      await this.invalidateArenaCache(data.arena_id);
    }

    return data;
  }

  /**
   * Process device heartbeat
   */
  async processHeartbeat(heartbeat: DeviceHeartbeat): Promise<Device> {
    // Find device by raspberry_pi_id
    const { data: devices, error: findError } = await supabaseAdmin
      .from('devices')
      .select('id, arena_id')
      .eq('raspberry_pi_id', heartbeat.raspberry_pi_id)
      .eq('is_active', true)
      .limit(1);

    if (findError) throw findError;

    if (!devices || devices.length === 0) {
      throw new Error(`Device with Raspberry Pi ID ${heartbeat.raspberry_pi_id} not found`);
    }

    const device = devices[0];

    // Update device with heartbeat data
    const updates: any = {
      status: heartbeat.status,
      last_heartbeat: new Date(),
      updated_at: new Date(),
    };

    if (heartbeat.battery_level !== undefined) {
      updates.battery_level = heartbeat.battery_level;
    }

    if (heartbeat.ip_address) {
      updates.ip_address = heartbeat.ip_address;
    }

    if (heartbeat.firmware_version) {
      updates.firmware_version = heartbeat.firmware_version;
    }

    if (heartbeat.metadata) {
      updates.metadata = heartbeat.metadata;
    }

    const { data, error } = await supabaseAdmin
      .from('devices')
      .update(updates)
      .eq('id', device.id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`device:${device.id}`);
    await this.invalidateArenaCache(device.arena_id);

    return data;
  }

  /**
   * Mark device as in use (during game session)
   */
  async markDeviceInUse(deviceId: string, sessionId: string): Promise<Device> {
    const device = await this.getDeviceById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    if (device.status === 'broken' || device.status === 'maintenance') {
      throw new Error(`Device is ${device.status} and cannot be used`);
    }

    if (device.status === 'offline') {
      throw new Error('Device is offline');
    }

    if (device.status === 'in_use') {
      throw new Error('Device is already in use');
    }

    // Update to in_use
    const { data, error } = await supabaseAdmin
      .from('devices')
      .update({
        status: 'in_use',
        metadata: {
          ...device.metadata,
          current_session_id: sessionId,
          session_started_at: new Date().toISOString(),
        },
        updated_at: new Date(),
      })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`device:${deviceId}`);
    await this.invalidateArenaCache(device.arena_id);

    return data;
  }

  /**
   * Release device (after game session)
   */
  async releaseDevice(deviceId: string): Promise<Device> {
    const device = await this.getDeviceById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    // Calculate session duration
    const sessionStartedAt = device.metadata?.session_started_at;
    let uptimeHours = 0;

    if (sessionStartedAt) {
      const startTime = new Date(sessionStartedAt);
      const endTime = new Date();
      uptimeHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }

    // Update device
    const { data, error } = await supabaseAdmin
      .from('devices')
      .update({
        status: 'online',
        total_sessions: (device.total_sessions || 0) + 1,
        total_uptime_hours: (device.total_uptime_hours || 0) + uptimeHours,
        metadata: {
          ...device.metadata,
          current_session_id: null,
          session_started_at: null,
          last_session_ended_at: new Date().toISOString(),
        },
        updated_at: new Date(),
      })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`device:${deviceId}`);
    await this.invalidateArenaCache(device.arena_id);

    return data;
  }

  /**
   * Update device (admin only)
   */
  async updateDevice(
    deviceId: string,
    updates: Partial<Device>
  ): Promise<Device> {
    // Remove fields that shouldn't be updated via this method
    const allowedFields = [
      'name',
      'status',
      'firmware_version',
      'capabilities',
      'maintenance_schedule',
      'is_active',
      'metadata',
    ];

    const filteredUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key as keyof Device];
      }
    });

    filteredUpdates.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from('devices')
      .update(filteredUpdates)
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    await redis.del(`device:${deviceId}`);
    if (data) {
      await this.invalidateArenaCache(data.arena_id);
    }

    return data;
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(deviceId: string): Promise<any> {
    const cacheKey = `device_stats:${deviceId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const device = await this.getDeviceById(deviceId);

    if (!device) {
      throw new Error('Device not found');
    }

    // Get session count from game_sessions table
    const { count: sessionCount } = await supabaseAdmin
      .from('game_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('device_id', deviceId);

    const stats = {
      device_id: deviceId,
      name: device.name,
      status: device.status,
      total_sessions: sessionCount || 0,
      total_uptime_hours: device.total_uptime_hours || 0,
      battery_level: device.battery_level,
      last_heartbeat: device.last_heartbeat,
      firmware_version: device.firmware_version,
      created_at: device.created_at,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    return stats;
  }

  /**
   * Get all device types
   */
  async getDeviceTypes(): Promise<DeviceType[]> {
    const cacheKey = 'device_types:all';
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, error } = await supabaseAdmin
      .from('device_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Cache for 1 hour (device types change rarely)
    if (data) {
      await redis.setex(cacheKey, 3600, JSON.stringify(data));
    }

    return data || [];
  }

  /**
   * Invalidate arena devices cache
   */
  private async invalidateArenaCache(arenaId: string): Promise<void> {
    const patterns = [
      `arena_devices:${arenaId}:*`,
      `available_devices:${arenaId}`,
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}

export default new DevicesService();
