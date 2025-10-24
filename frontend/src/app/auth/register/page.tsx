'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (!acceptTerms) {
      alert('Примите условия использования');
      return;
    }

    setIsLoading(true);

    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Register:', formData);
    setIsLoading(false);
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);

    // Mock wallet connect
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Wallet connected');
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-cyan-purple">ArenaHUB</span>
          </h1>
          <p className="text-muted-foreground">
            Создайте аккаунт и начните играть
          </p>
        </div>

        {/* Register Card */}
        <Card glow className="glass">
          <CardHeader>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>
              Заполните форму для создания аккаунта
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Имя пользователя
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username123"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  3-20 символов, только буквы, цифры и подчеркивания
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
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Минимум 8 символов
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Подтвердите пароль
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Я принимаю{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Условия использования
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Политику конфиденциальности
                  </Link>
                </label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-space-dark-gray px-4 text-muted-foreground">
                  или
                </span>
              </div>
            </div>

            {/* Wallet Connect */}
            <Button
              variant="glass"
              className="w-full"
              onClick={handleWalletConnect}
              disabled={isLoading}
            >
              <span className="mr-2">👛</span>
              Подключить кошелек
            </Button>

            {/* Social Registration */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <span className="mr-2">G</span>
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <span className="mr-2">D</span>
                Discord
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Войти
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Benefits */}
        <Card glow className="glass mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Преимущества регистрации</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Доступ ко всем аренам и турнирам</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Покупка и продажа NFT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Стейкинг токенов с APY до 120%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>Участие в глобальном рейтинге</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
