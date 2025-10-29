'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UsersIcon,
  ArenaIcon,
  TrophyIcon,
  CoinsIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  ShieldIcon,
  SettingsIcon,
  DatabaseIcon,
  ActivityIcon,
} from '@/components/ui/icons';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalArenas: number;
  activeArenas: number;
  totalRevenue: number;
  totalTransactions: number;
  platformFees: number;
  pendingVerifications: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'arena' | 'transaction' | 'alert';
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'critical';
}

const MOCK_STATS: SystemStats = {
  totalUsers: 105234,
  activeUsers: 8945,
  totalArenas: 234,
  activeArenas: 187,
  totalRevenue: 12500000,
  totalTransactions: 456789,
  platformFees: 1250000,
  pendingVerifications: 15,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'alert',
    message: 'High server load detected on EU-West cluster',
    timestamp: '2 минуты назад',
    severity: 'warning',
  },
  {
    id: '2',
    type: 'arena',
    message: 'New arena "Singapore Tech Hub" registered',
    timestamp: '15 минут назад',
    severity: 'info',
  },
  {
    id: '3',
    type: 'user',
    message: 'Mass user registration spike: +234 users in 1 hour',
    timestamp: '1 час назад',
    severity: 'info',
  },
  {
    id: '4',
    type: 'transaction',
    message: 'Suspicious transaction pattern detected (User ID: 12345)',
    timestamp: '2 часа назад',
    severity: 'critical',
  },
  {
    id: '5',
    type: 'arena',
    message: 'Arena "Moscow Sky Arena" verification completed',
    timestamp: '3 часа назад',
    severity: 'info',
  },
];

const SEVERITY_CONFIG = {
  info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold flex items-center gap-4">
            <ShieldIcon size={48} className="text-cyan-400" />
            <span className="text-gradient-cyan-purple">Platform Admin Panel</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Централизованное управление платформой ArenaHUB
          </p>
        </div>

        {/* Key System Metrics */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card glow className="glass border-cyan-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <UsersIcon size={24} className="text-cyan-400" />
                </div>
                <Badge variant="outline" className="text-green-400">
                  <TrendingUpIcon size={12} className="mr-1" />
                  +8.5%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
              <p className="text-3xl font-bold text-cyan-400">{MOCK_STATS.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Активных: {MOCK_STATS.activeUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card glow className="glass border-purple-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <ArenaIcon size={24} className="text-purple-400" />
                </div>
                <Badge variant="outline" className="text-green-400">
                  <TrendingUpIcon size={12} className="mr-1" />
                  +5.2%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Всего арен</p>
              <p className="text-3xl font-bold text-purple-400">{MOCK_STATS.totalArenas}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Активных: {MOCK_STATS.activeArenas}
              </p>
            </CardContent>
          </Card>

          <Card glow className="glass border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <CoinsIcon size={24} className="text-orange-400" />
                </div>
                <Badge variant="outline" className="text-green-400">
                  <TrendingUpIcon size={12} className="mr-1" />
                  +12.3%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Общий оборот (PAC)</p>
              <p className="text-3xl font-bold text-orange-400">
                {(MOCK_STATS.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Комиссия: {(MOCK_STATS.platformFees / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>

          <Card glow className="glass border-pink-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <AlertTriangleIcon size={24} className="text-pink-400" />
                </div>
                <Badge variant="outline" className="text-yellow-400">
                  Требуют внимания
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Верификации арен</p>
              <p className="text-3xl font-bold text-pink-400">{MOCK_STATS.pendingVerifications}</p>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <Link href="/dashboard/admin/verifications">Проверить</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="mb-8">
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Период анализа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === '24h' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('24h')}
                >
                  24 часа
                </Button>
                <Button
                  variant={selectedPeriod === '7d' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('7d')}
                >
                  7 дней
                </Button>
                <Button
                  variant={selectedPeriod === '30d' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('30d')}
                >
                  30 дней
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-white">Быстрые действия</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="neon" className="h-auto py-6 flex-col gap-2" asChild>
              <Link href="/dashboard/admin/users">
                <UsersIcon size={28} />
                <span className="text-lg">Управление пользователями</span>
                <span className="text-xs text-muted-foreground">{MOCK_STATS.totalUsers.toLocaleString()} пользователей</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link href="/dashboard/admin/arenas">
                <ArenaIcon size={28} />
                <span className="text-lg">Управление аренами</span>
                <span className="text-xs text-muted-foreground">{MOCK_STATS.totalArenas} арен</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link href="/dashboard/admin/transactions">
                <CoinsIcon size={28} />
                <span className="text-lg">Транзакции</span>
                <span className="text-xs text-muted-foreground">{MOCK_STATS.totalTransactions.toLocaleString()} транзакций</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
              <Link href="/dashboard/admin/settings">
                <SettingsIcon size={28} />
                <span className="text-lg">Системные настройки</span>
                <span className="text-xs text-muted-foreground">Конфигурация</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* System Health & Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* System Health */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon size={20} className="text-green-400" />
                Системное здоровье
              </CardTitle>
              <CardDescription>Мониторинг критических компонентов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div>
                      <p className="font-medium text-white">API Server</p>
                      <p className="text-xs text-muted-foreground">Response time: 45ms</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div>
                      <p className="font-medium text-white">Database</p>
                      <p className="text-xs text-muted-foreground">Connections: 234/1000</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <div>
                      <p className="font-medium text-white">Media Server</p>
                      <p className="text-xs text-muted-foreground">CPU usage: 78%</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Warning</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div>
                      <p className="font-medium text-white">Blockchain Service</p>
                      <p className="text-xs text-muted-foreground">Block height: 245678</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Synced</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon size={20} className="text-cyan-400" />
                Последняя активность
              </CardTitle>
              <CardDescription>Системные события и алерты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ACTIVITIES.map((activity) => {
                  const config = activity.severity ? SEVERITY_CONFIG[activity.severity] : SEVERITY_CONFIG.info;
                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
                    >
                      <p className={`text-sm font-medium ${config.text}`}>{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Посмотреть все события
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* User Management */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/users">Все пользователи</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/users/banned">Заблокированные</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/users/reports">Жалобы</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/users/kyc">KYC верификация</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Arena Management */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Управление аренами</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/arenas">Все арены</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/arenas/pending">Ожидают верификации</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/arenas/offline">Оффлайн арены</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/arenas/analytics">Аналитика арен</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Financial Management */}
          <Card glow className="glass">
            <CardHeader>
              <CardTitle>Финансы и токены</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/transactions">Все транзакции</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/transactions/suspicious">Подозрительные</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/tokens">Токеномика GAC/PAC</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/admin/withdrawals">Выводы средств</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
