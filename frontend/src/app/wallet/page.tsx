'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const MOCK_WALLET = {
  gac_balance: 1250.5,
  pac_balance: 8540.25,
  staked_amount: 5000,
  staking_tier: 'silver',
  stake_unlock_date: '2025-03-15',
};

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'deposit',
    amount: 1000,
    token: 'PAC',
    status: 'completed',
    timestamp: '2025-01-20T10:30:00Z',
    hash: '0xabcd...1234',
  },
  {
    id: '2',
    type: 'game_fee',
    amount: -50,
    token: 'PAC',
    status: 'completed',
    timestamp: '2025-01-20T11:00:00Z',
    reference: 'Tokyo Cyber Arena',
  },
  {
    id: '3',
    type: 'stake',
    amount: -5000,
    token: 'PAC',
    status: 'completed',
    timestamp: '2025-01-19T15:00:00Z',
  },
  {
    id: '4',
    type: 'tournament_reward',
    amount: 500,
    token: 'PAC',
    status: 'completed',
    timestamp: '2025-01-18T20:00:00Z',
    reference: 'Tokyo Spring Championship',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: -200,
    token: 'GAC',
    status: 'pending',
    timestamp: '2025-01-20T12:00:00Z',
    hash: '0xef12...5678',
  },
];

const TRANSACTION_TYPES: Record<string, { label: string; icon: string }> = {
  deposit: { label: 'Пополнение', icon: '⬇️' },
  withdrawal: { label: 'Вывод', icon: '⬆️' },
  game_fee: { label: 'Игровая сессия', icon: '🎮' },
  stake: { label: 'Стейкинг', icon: '🔒' },
  unstake: { label: 'Анстейкинг', icon: '🔓' },
  tournament_reward: { label: 'Награда турнира', icon: '🏆' },
  bet: { label: 'Ставка', icon: '🎲' },
  nft_purchase: { label: 'Покупка NFT', icon: '🖼️' },
  nft_sale: { label: 'Продажа NFT', icon: '💰' },
};

export default function WalletPage() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);

  const daysUntilUnlock = Math.ceil(
    (new Date(MOCK_WALLET.stake_unlock_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border/40 bg-gradient-to-b from-background to-space-dark-gray py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold">
            <span className="text-gradient-cyan-purple">Кошелёк</span>
          </h1>
          <p className="text-muted-foreground">Управление токенами и транзакциями</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GAC Balance */}
              <Card glow className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>GAC Token</CardTitle>
                    <Badge variant="neon">Governance</Badge>
                  </div>
                  <CardDescription>Токен управления платформой</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary mb-6">
                    {MOCK_WALLET.gac_balance.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="neon" className="flex-1">
                      Купить
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Продать
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PAC Balance */}
              <Card glow className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>PAC Token</CardTitle>
                    <Badge variant="secondary">Utility</Badge>
                  </div>
                  <CardDescription>Игровая валюта</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-secondary mb-6">
                    {MOCK_WALLET.pac_balance.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1">
                      Купить
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Продать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operations Tabs */}
            <Card glow>
              <CardHeader>
                <CardTitle>Операции</CardTitle>
                <CardDescription>Пополнение, вывод и стейкинг</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="deposit">Пополнить</TabsTrigger>
                    <TabsTrigger value="withdraw">Вывести</TabsTrigger>
                    <TabsTrigger value="stake">Стейкинг</TabsTrigger>
                  </TabsList>

                  {/* Deposit Tab */}
                  <TabsContent value="deposit" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Сумма</label>
                      <Input
                        type="number"
                        placeholder="Введите сумму..."
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Токен</label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          PAC
                        </Button>
                        <Button variant="outline" className="flex-1">
                          GAC
                        </Button>
                      </div>
                    </div>
                    <div className="glass rounded-lg p-4 text-sm">
                      <p className="text-muted-foreground mb-2">Инструкция:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Выберите токен для пополнения</li>
                        <li>Введите сумму</li>
                        <li>Подтвердите транзакцию в кошельке</li>
                      </ol>
                    </div>
                    <Button variant="neon" className="w-full">
                      Пополнить кошелёк
                    </Button>
                  </TabsContent>

                  {/* Withdraw Tab */}
                  <TabsContent value="withdraw" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Сумма</label>
                      <Input
                        type="number"
                        placeholder="Введите сумму..."
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Адрес получателя</label>
                      <Input placeholder="0x..." />
                    </div>
                    <div className="glass rounded-lg p-4 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Комиссия сети:</span>
                        <span className="font-bold">~0.5 PAC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Получите:</span>
                        <span className="font-bold text-primary">
                          {withdrawAmount ? (Number(withdrawAmount) - 0.5).toFixed(2) : '0'} PAC
                        </span>
                      </div>
                    </div>
                    <Button variant="neon" className="w-full">
                      Вывести
                    </Button>
                  </TabsContent>

                  {/* Stake Tab */}
                  <TabsContent value="stake" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Сумма PAC</label>
                      <Input
                        type="number"
                        placeholder="Минимум 1000 PAC"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Период стейкинга</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[30, 90, 180, 365].map((days) => (
                          <Button
                            key={days}
                            variant={selectedDuration === days ? 'neon' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDuration(days)}
                          >
                            {days}д
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APY:</span>
                        <span className="font-bold text-primary">
                          {selectedDuration === 30
                            ? '5%'
                            : selectedDuration === 90
                              ? '8%'
                              : selectedDuration === 180
                                ? '12%'
                                : '15%'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ожидаемая награда:</span>
                        <span className="font-bold">
                          {stakeAmount
                            ? (
                                Number(stakeAmount) *
                                (selectedDuration === 30
                                  ? 0.05
                                  : selectedDuration === 90
                                    ? 0.08
                                    : selectedDuration === 180
                                      ? 0.12
                                      : 0.15) *
                                (selectedDuration / 365)
                              ).toFixed(2)
                            : '0'}{' '}
                          PAC
                        </span>
                      </div>
                    </div>
                    <Button variant="neon" className="w-full">
                      Застейкать
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card glow>
              <CardHeader>
                <CardTitle>История транзакций</CardTitle>
                <CardDescription>Последние операции</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg glass hover-lift"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {TRANSACTION_TYPES[tx.type]?.icon || '💸'}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {TRANSACTION_TYPES[tx.type]?.label || tx.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString('ru-RU', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {tx.reference && (
                            <p className="text-xs text-muted-foreground">{tx.reference}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount} {tx.token}
                        </p>
                        <Badge
                          variant={tx.status === 'completed' ? 'success' : 'warning'}
                          className="text-xs mt-1"
                        >
                          {tx.status === 'completed' ? 'Завершено' : 'В обработке'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Показать все
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Staking */}
            <Card glow>
              <CardHeader>
                <CardTitle>Активный стейкинг</CardTitle>
                <CardDescription>Ваши замороженные токены</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg glass">
                  <p className="text-sm text-muted-foreground mb-1">Застейкано</p>
                  <p className="text-3xl font-bold text-neon-purple">
                    {MOCK_WALLET.staked_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PAC</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Уровень</span>
                    <Badge variant="secondary">Silver</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">APY</span>
                    <span className="font-bold text-primary">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Разблокировка</span>
                    <span className="font-bold">{daysUntilUnlock} дней</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Progress</p>
                  <div className="h-2 bg-space-border-gray rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: '65%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">65% времени прошло</p>
                </div>

                <Button variant="destructive" className="w-full" disabled>
                  Анстейкать рано
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card glow>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Всего пополнений</span>
                  <span className="font-bold">12,450 PAC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Всего выводов</span>
                  <span className="font-bold">3,200 PAC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Заработано наград</span>
                  <span className="font-bold text-primary">1,850 PAC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Потрачено на игры</span>
                  <span className="font-bold">2,100 PAC</span>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card glow>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">2FA</span>
                  <Badge variant="success">Включено</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email подтверждение</span>
                  <Badge variant="success">Включено</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Лимит вывода</span>
                  <span className="font-bold">10,000 PAC/день</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
