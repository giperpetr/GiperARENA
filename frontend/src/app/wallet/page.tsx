'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

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

  // Fetch current user
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response: any = await api.getCurrentUser();
      return response.data || response;
    },
  });

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response: any = await api.getWallet(user.id);
      return response.data || response;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response: any = await api.getTransactions(user.id, { limit: 10 });
      return response.data || response || [];
    },
    enabled: !!user?.id,
  });

  const daysUntilUnlock = wallet?.stake_unlock_date
    ? Math.ceil((new Date(wallet.stake_unlock_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Auth error handling
  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card glow className="max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Войдите в систему, чтобы просмотреть ваш кошелёк
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="neon" className="w-full" onClick={() => (window.location.href = '/auth/login')}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = userLoading || walletLoading;

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
                  {isLoading ? (
                    <Skeleton className="h-12 w-32 mb-6" />
                  ) : (
                    <p className="text-4xl font-bold text-primary mb-6">
                      {(wallet?.gac_balance || 0).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="neon" className="flex-1" disabled={isLoading}>
                      Купить
                    </Button>
                    <Button variant="outline" className="flex-1" disabled={isLoading}>
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
                  {isLoading ? (
                    <Skeleton className="h-12 w-32 mb-6" />
                  ) : (
                    <p className="text-4xl font-bold text-secondary mb-6">
                      {(wallet?.pac_balance || 0).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" disabled={isLoading}>
                      Купить
                    </Button>
                    <Button variant="outline" className="flex-1" disabled={isLoading}>
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
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {transactions.map((tx: any) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 rounded-lg glass hover-lift"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {TRANSACTION_TYPES[tx.transaction_type]?.icon || '💸'}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {TRANSACTION_TYPES[tx.transaction_type]?.label || tx.transaction_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleString('ru-RU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {tx.description && (
                                <p className="text-xs text-muted-foreground">{tx.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-foreground'}`}
                            >
                              {tx.amount > 0 ? '+' : ''}
                              {tx.amount} {tx.token_type}
                            </p>
                            <Badge
                              variant={tx.status === 'completed' ? 'success' : 'warning'}
                              className="text-xs mt-1"
                            >
                              {tx.status === 'completed' ? 'Завершено' : tx.status === 'pending' ? 'В обработке' : tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Показать все
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Транзакций пока нет</p>
                  </div>
                )}
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
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : wallet?.staked_amount && wallet.staked_amount > 0 ? (
                  <>
                    <div className="text-center p-4 rounded-lg glass">
                      <p className="text-sm text-muted-foreground mb-1">Застейкано</p>
                      <p className="text-3xl font-bold text-neon-purple">
                        {wallet.staked_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PAC</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Уровень</span>
                        <Badge variant="secondary">
                          {wallet.staking_tier ? wallet.staking_tier.charAt(0).toUpperCase() + wallet.staking_tier.slice(1) : 'Bronze'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APY</span>
                        <span className="font-bold text-primary">8%</span>
                      </div>
                      {daysUntilUnlock > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Разблокировка</span>
                          <span className="font-bold">{daysUntilUnlock} дней</span>
                        </div>
                      )}
                    </div>

                    {daysUntilUnlock > 0 && wallet.stake_unlock_date && (
                      <>
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Progress</p>
                          <div className="h-2 bg-space-border-gray rounded-full overflow-hidden mb-1">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{
                                width: `${Math.min(100, Math.max(0, ((Date.now() - new Date(wallet.stake_unlock_date).getTime() + (daysUntilUnlock * 24 * 60 * 60 * 1000)) / (daysUntilUnlock * 24 * 60 * 60 * 1000)) * 100))}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Math.min(100, Math.max(0, ((Date.now() - new Date(wallet.stake_unlock_date).getTime() + (daysUntilUnlock * 24 * 60 * 60 * 1000)) / (daysUntilUnlock * 24 * 60 * 60 * 1000)) * 100)).toFixed(0)}% времени прошло
                          </p>
                        </div>

                        <Button variant="destructive" className="w-full" disabled>
                          Анстейкать рано
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">У вас нет активного стейкинга</p>
                    <Button variant="outline" size="sm">
                      Начать стейкинг
                    </Button>
                  </div>
                )}
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
