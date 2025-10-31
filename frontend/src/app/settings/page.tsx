'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  // Fetch current user
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response: any = await api.getCurrentUser();
      return response.data || response;
    },
  });

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '🎮',
  });

  // Update profile state when user data loads
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar_url || '🎮',
      });
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    email_games: true,
    email_tournaments: true,
    email_marketplace: false,
    push_games: true,
    push_tournaments: true,
    push_marketplace: true,
  });

  const [privacy, setPrivacy] = useState({
    show_profile: true,
    show_stats: true,
    show_wallet: false,
    show_nfts: true,
  });

  const [security, setSecurity] = useState({
    two_factor: false,
    session_timeout: '30',
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      return api.updateProfile(updates);
    },
    onSuccess: () => {
      alert('Профиль успешно обновлен!');
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      avatar_url: profile.avatar,
    });
  };

  const handleSaveNotifications = () => {
    console.log('Save notifications:', notifications);
    alert('Настройки уведомлений сохранены!');
  };

  const handleSavePrivacy = () => {
    console.log('Save privacy:', privacy);
    alert('Настройки приватности сохранены!');
  };

  const handleSaveSecurity = () => {
    console.log('Save security:', security);
    alert('Настройки безопасности сохранены!');
  };

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">
            <span className="text-gradient-cyan-purple">Настройки</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Управление аккаунтом и предпочтениями
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="privacy">Приватность</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
                <CardDescription>
                  Обновите свою публичную информацию
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium mb-2">Аватар</label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-space-medium-gray text-4xl">
                      {profile.avatar}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Выбрать эмодзи
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Или загрузите изображение
                      </p>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Имя пользователя
                  </label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="username123"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Это ваше публичное имя в ArenaHUB
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-2">
                    Биография
                  </label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Расскажите о себе..."
                    rows={4}
                    className="w-full rounded-md border border-border/40 bg-space-dark-gray/50 px-3 py-2 text-sm transition-colors hover:border-primary/30 focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Максимум 500 символов
                  </p>
                </div>

                {/* Connected Wallets */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Подключенные кошельки
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👛</span>
                        <div>
                          <div className="text-sm font-medium">MetaMask</div>
                          <code className="text-xs text-muted-foreground">
                            0x1234...5678
                          </code>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Активен
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      + Добавить кошелек
                    </Button>
                  </div>
                </div>

                <Button variant="neon" onClick={handleSaveProfile}>
                  Сохранить изменения
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>
                  Управляйте уведомлениями по email и push
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email уведомления</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Результаты игр</span>
                      <input
                        type="checkbox"
                        checked={notifications.email_games}
                        onChange={(e) => setNotifications({ ...notifications, email_games: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Турниры и события</span>
                      <input
                        type="checkbox"
                        checked={notifications.email_tournaments}
                        onChange={(e) => setNotifications({ ...notifications, email_tournaments: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">NFT маркетплейс</span>
                      <input
                        type="checkbox"
                        checked={notifications.email_marketplace}
                        onChange={(e) => setNotifications({ ...notifications, email_marketplace: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Push уведомления</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Начало игры</span>
                      <input
                        type="checkbox"
                        checked={notifications.push_games}
                        onChange={(e) => setNotifications({ ...notifications, push_games: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Турниры и события</span>
                      <input
                        type="checkbox"
                        checked={notifications.push_tournaments}
                        onChange={(e) => setNotifications({ ...notifications, push_tournaments: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm">Продажа NFT</span>
                      <input
                        type="checkbox"
                        checked={notifications.push_marketplace}
                        onChange={(e) => setNotifications({ ...notifications, push_marketplace: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                </div>

                <Button variant="neon" onClick={handleSaveNotifications}>
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Настройки приватности</CardTitle>
                <CardDescription>
                  Контролируйте видимость вашей информации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">Показывать профиль</div>
                      <div className="text-xs text-muted-foreground">
                        Другие пользователи смогут видеть ваш профиль
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.show_profile}
                      onChange={(e) => setPrivacy({ ...privacy, show_profile: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">Показывать статистику</div>
                      <div className="text-xs text-muted-foreground">
                        Публичная видимость ваших побед и игр
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.show_stats}
                      onChange={(e) => setPrivacy({ ...privacy, show_stats: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">Показывать баланс кошелька</div>
                      <div className="text-xs text-muted-foreground">
                        Другие увидят ваш баланс токенов
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.show_wallet}
                      onChange={(e) => setPrivacy({ ...privacy, show_wallet: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">Показывать NFT коллекцию</div>
                      <div className="text-xs text-muted-foreground">
                        Публичная видимость ваших NFT
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.show_nfts}
                      onChange={(e) => setPrivacy({ ...privacy, show_nfts: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </label>
                </div>

                <Button variant="neon" onClick={handleSavePrivacy}>
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card glow className="glass">
              <CardHeader>
                <CardTitle>Настройки безопасности</CardTitle>
                <CardDescription>
                  Защитите свой аккаунт
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Two Factor Auth */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium">Двухфакторная аутентификация</div>
                      <div className="text-xs text-muted-foreground">
                        Добавьте дополнительный уровень безопасности
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={security.two_factor}
                      onChange={(e) => setSecurity({ ...security, two_factor: e.target.checked })}
                      className="h-4 w-4"
                    />
                  </div>
                  {security.two_factor && (
                    <Button variant="outline" size="sm" className="mt-2">
                      Настроить 2FA
                    </Button>
                  )}
                </div>

                {/* Change Password */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Изменить пароль</h3>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Текущий пароль"
                    />
                    <Input
                      type="password"
                      placeholder="Новый пароль"
                    />
                    <Input
                      type="password"
                      placeholder="Подтвердите новый пароль"
                    />
                    <Button variant="outline">
                      Обновить пароль
                    </Button>
                  </div>
                </div>

                {/* Session Timeout */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Таймаут сессии (минуты)
                  </label>
                  <Input
                    type="number"
                    value={security.session_timeout}
                    onChange={(e) => setSecurity({ ...security, session_timeout: e.target.value })}
                    min="5"
                    max="120"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Автоматический выход после неактивности
                  </p>
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Активные сессии</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                      <div>
                        <div className="text-sm font-medium">💻 MacBook Pro</div>
                        <div className="text-xs text-muted-foreground">
                          Москва, Россия • Сейчас
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Текущая
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                      <div>
                        <div className="text-sm font-medium">📱 iPhone 15</div>
                        <div className="text-xs text-muted-foreground">
                          Москва, Россия • 2 часа назад
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Завершить
                      </Button>
                    </div>
                  </div>
                </div>

                <Button variant="neon" onClick={handleSaveSecurity}>
                  Сохранить настройки
                </Button>

                {/* Danger Zone */}
                <div className="rounded-lg border-2 border-red-500/20 bg-red-500/5 p-4">
                  <h3 className="text-sm font-medium text-red-500 mb-2">Опасная зона</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Эти действия необратимы. Будьте осторожны.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full text-red-500 border-red-500 hover:bg-red-500/10">
                      Отключить все устройства
                    </Button>
                    <Button variant="outline" className="w-full text-red-500 border-red-500 hover:bg-red-500/10">
                      Удалить аккаунт
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
