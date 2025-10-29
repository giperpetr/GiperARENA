'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArenaIcon,
  TrophyIcon,
  CoinsIcon,
  UsersIcon,
  SettingsIcon,
  EyeIcon,
  PlayIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  CalendarIcon,
  VideoIcon,
  WalletIcon,
} from '@/components/ui/icons';

interface Arena {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  devices: number;
  activeGames: number;
  revenue: number; // PAC tokens
  viewers: number;
}

interface DeviceStatus {
  id: string;
  arenaId: string;
  type: 'drone' | 'robot' | 'crawler';
  name: string;
  status: 'online' | 'offline' | 'in_use' | 'maintenance';
  battery: number;
  lastUsed: string;
}

const MOCK_ARENAS: Arena[] = [
  {
    id: '1',
    name: 'Tokyo Cyber Arena',
    location: 'Tokyo, Japan',
    status: 'active',
    devices: 12,
    activeGames: 3,
    revenue: 45600,
    viewers: 234,
  },
  {
    id: '2',
    name: 'Moscow Sky Arena',
    location: 'Moscow, Russia',
    status: 'active',
    devices: 8,
    activeGames: 2,
    revenue: 32400,
    viewers: 156,
  },
  {
    id: '3',
    name: 'Berlin Battle Zone',
    location: 'Berlin, Germany',
    status: 'maintenance',
    devices: 10,
    activeGames: 0,
    revenue: 28900,
    viewers: 0,
  },
];

const MOCK_DEVICES: DeviceStatus[] = [
  {
    id: 'd1',
    arenaId: '1',
    type: 'drone',
    name: 'Drone Alpha-1',
    status: 'in_use',
    battery: 87,
    lastUsed: '2 минуты назад',
  },
  {
    id: 'd2',
    arenaId: '1',
    type: 'drone',
    name: 'Drone Beta-2',
    status: 'online',
    battery: 95,
    lastUsed: '15 минут назад',
  },
  {
    id: 'd3',
    arenaId: '1',
    type: 'robot',
    name: 'BattleBot X',
    status: 'in_use',
    battery: 72,
    lastUsed: '5 минут назад',
  },
  {
    id: 'd4',
    arenaId: '2',
    type: 'drone',
    name: 'Sky Racer 1',
    status: 'online',
    battery: 100,
    lastUsed: '1 час назад',
  },
  {
    id: 'd5',
    arenaId: '3',
    type: 'robot',
    name: 'Titan Mk-II',
    status: 'maintenance',
    battery: 45,
    lastUsed: '3 часа назад',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Активна', color: 'bg-green-500/20 text-green-400 border-green-500' },
  maintenance: { label: 'Обслуживание', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
  offline: { label: 'Оффлайн', color: 'bg-red-500/20 text-red-400 border-red-500' },
};

const DEVICE_STATUS_CONFIG = {
  online: { label: 'Доступен', color: 'bg-green-500/20 text-green-400' },
  offline: { label: 'Оффлайн', color: 'bg-gray-500/20 text-gray-400' },
  in_use: { label: 'Используется', color: 'bg-cyan-500/20 text-cyan-400' },
  maintenance: { label: 'Ремонт', color: 'bg-yellow-500/20 text-yellow-400' },
};

export default function ArenaOwnerDashboard() {
  const [selectedArena, setSelectedArena] = useState<string | null>(null);

  const totalRevenue = MOCK_ARENAS.reduce((sum, arena) => sum + arena.revenue, 0);
  const totalDevices = MOCK_ARENAS.reduce((sum, arena) => sum + arena.devices, 0);
  const totalViewers = MOCK_ARENAS.reduce((sum, arena) => sum + arena.viewers, 0);
  const activeArenas = MOCK_ARENAS.filter((a) => a.status === 'active').length;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-gradient-cyan-purple">Arena Owner Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Управление вашими аренами, устройствами и доходами
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card glow className="glass border-cyan-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Активных арен</p>
                  <p className="text-3xl font-bold text-cyan-400">{activeArenas}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    из {MOCK_ARENAS.length} всего
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <ArenaIcon size={24} className="text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-purple-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Доход (30 дней)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUpIcon size={12} />
                    +12% с прошлого месяца
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CoinsIcon size={24} className="text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Устройств</p>
                  <p className="text-3xl font-bold text-orange-400">{totalDevices}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {MOCK_DEVICES.filter((d) => d.status === 'in_use').length} в игре
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <PlayIcon size={24} className="text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-pink-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Зрителей</p>
                  <p className="text-3xl font-bold text-pink-400">{totalViewers}</p>
                  <p className="text-xs text-muted-foreground mt-1">в реальном времени</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <EyeIcon size={24} className="text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="neon" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/arena-owner/arenas/new">
                    <ArenaIcon size={24} />
                    <span>Добавить арену</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/arena-owner/devices">
                    <PlayIcon size={24} />
                    <span>Управление устройствами</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/arena-owner/tournaments">
                    <TrophyIcon size={24} />
                    <span>Создать турнир</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/arena-owner/analytics">
                    <TrendingUpIcon size={24} />
                    <span>Аналитика</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Arenas */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-white flex items-center gap-3">
            <ArenaIcon size={32} className="text-cyan-400" />
            Мои арены
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {MOCK_ARENAS.map((arena) => (
              <Card key={arena.id} glow className="glass hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{arena.name}</CardTitle>
                      <CardDescription className="text-base">{arena.location}</CardDescription>
                    </div>
                    <Badge className={STATUS_CONFIG[arena.status].color}>
                      {STATUS_CONFIG[arena.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Устройств</p>
                      <p className="text-2xl font-bold text-white">{arena.devices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Активных игр</p>
                      <p className="text-2xl font-bold text-cyan-400">{arena.activeGames}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Доход (PAC)</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {arena.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Зрителей</p>
                      <p className="text-2xl font-bold text-pink-400">{arena.viewers}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="neon" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/arena-owner/arenas/${arena.id}`}>
                        Управление
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/arena-owner/arenas/${arena.id}/stream`}>
                        <VideoIcon size={16} className="mr-2" />
                        Стрим
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/arena-owner/arenas/${arena.id}/settings`}>
                        <SettingsIcon size={16} />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Device Status */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-white flex items-center gap-3">
            <PlayIcon size={32} className="text-orange-400" />
            Статус устройств
          </h2>
          <Card glow className="glass">
            <CardContent className="p-6">
              <div className="space-y-4">
                {MOCK_DEVICES.map((device) => {
                  const arena = MOCK_ARENAS.find((a) => a.id === device.arenaId);
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                            device.type === 'drone'
                              ? 'bg-cyan-500/20'
                              : device.type === 'robot'
                                ? 'bg-purple-500/20'
                                : 'bg-orange-500/20'
                          }`}
                        >
                          {device.type === 'drone' ? '🚁' : device.type === 'robot' ? '🤖' : '🏎️'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{arena?.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Badge className={DEVICE_STATUS_CONFIG[device.status].color}>
                            {DEVICE_STATUS_CONFIG[device.status].label}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{device.lastUsed}</p>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="text-sm text-muted-foreground">Батарея</p>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-space-medium-gray rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  device.battery > 70
                                    ? 'bg-green-500'
                                    : device.battery > 30
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${device.battery}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">{device.battery}%</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          Детали
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card glow className="glass border-yellow-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon size={20} className="text-yellow-400" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm font-medium text-yellow-400">
                    Berlin Battle Zone - плановое обслуживание
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2 часа назад</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-medium text-red-400">
                    Titan Mk-II требует замены батареи
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">5 часов назад</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-sm font-medium text-cyan-400">
                    Tokyo Cyber Arena - новый рекорд зрителей (234)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">1 день назад</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glow className="glass border-purple-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon size={20} className="text-purple-400" />
                Финансы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Баланс PAC</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ожидается</p>
                    <p className="text-lg font-bold text-cyan-400">+15,600</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Комиссия платформы</p>
                    <p className="text-lg font-bold text-muted-foreground">-3,240</p>
                  </div>
                </div>
                <Button variant="neon" className="w-full" asChild>
                  <Link href="/dashboard/arena-owner/wallet">
                    <WalletIcon size={16} className="mr-2" />
                    Управление финансами
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
