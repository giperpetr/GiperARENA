'use client';


import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Login:', { email, password });
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
            Добро пожаловать в будущее киберспорта
          </p>
        </div>

        {/* Login Card */}
        <Card glow className="glass">
          <CardHeader>
            <CardTitle className="text-2xl">Вход</CardTitle>
            <CardDescription>
              Войдите в свой аккаунт чтобы продолжить
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
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

            {/* Social Login */}
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
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Terms */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Входя в систему, вы соглашаетесь с{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Условиями использования
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Политикой конфиденциальности
          </Link>
        </p>
      </div>
    </main>
  );
}
