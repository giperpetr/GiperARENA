'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserIcon, WalletIcon, CheckIcon } from '@/components/ui/icons';

type RegistrationStep = 'method' | 'form' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<RegistrationStep>('method');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (!captchaVerified) {
      alert('Пожалуйста, пройдите проверку капчи');
      return;
    }

    if (!agreedToTerms) {
      alert('Пожалуйста, примите условия использования');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep('success');
  };

  const handleSocialLogin = (provider: string) => {
    alert(`OAuth регистрация через ${provider} будет реализована с использованием Supabase Auth`);
  };

  if (step === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <Card glow className="glass w-full max-w-md border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckIcon size={32} className="text-green-400" />
            </div>
            <CardTitle className="text-3xl">Регистрация успешна!</CardTitle>
            <CardDescription className="text-base">
              Добро пожаловать в ArenaHUB, {username}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm text-cyan-400">
                📧 Мы отправили письмо с подтверждением на <strong>{email}</strong>
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Пожалуйста, подтвердите ваш email, чтобы начать играть в арены
            </p>
            <Button variant="neon" className="w-full" asChild>
              <Link href="/profile">Перейти в профиль</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">На главную</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (step === 'form') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <Card glow className="glass w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl">Регистрация игрока</CardTitle>
            <CardDescription className="text-base">
              Создайте аккаунт, чтобы начать играть
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-space-medium-gray/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  className="w-full h-12 px-4 bg-space-medium-gray/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="YourUsername"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-20 символов, только буквы, цифры и _
                </p>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 px-4 bg-space-medium-gray/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground mt-1">Минимум 8 символов</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Подтвердите пароль
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-space-medium-gray/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {/* Captcha (Mock) */}
              <div className="p-4 border border-border/50 rounded-lg bg-space-dark-gray/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="captcha"
                    checked={captchaVerified}
                    onChange={(e) => setCaptchaVerified(e.target.checked)}
                    className="w-5 h-5 rounded border-border/50 bg-space-medium-gray/40"
                  />
                  <label htmlFor="captcha" className="text-sm">
                    Я не робот 🤖
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  В production будет использоваться hCaptcha или reCAPTCHA
                </p>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border/50 bg-space-medium-gray/40"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Я принимаю{' '}
                  <Link href="/terms" className="text-cyan-400 hover:underline">
                    условия использования
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:underline">
                    политику конфиденциальности
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                disabled={isLoading || !captchaVerified || !agreedToTerms}
              >
                {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
              </Button>

              {/* Back */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('method')}
              >
                Назад
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-cyan-400 hover:underline font-medium">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Step: Choose registration method
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-cyan-purple">Присоединяйтесь к ArenaHUB</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Выберите способ регистрации и начните играть
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Player Registration */}
          <Card glow className="glass border-cyan-500/50 hover:border-cyan-500 transition-all cursor-pointer">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <UserIcon size={32} className="text-cyan-400" />
              </div>
              <CardTitle className="text-2xl">Регистрация игрока</CardTitle>
              <CardDescription className="text-base">
                Быстрая регистрация для игры в аренах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Управляйте роботами и дронами</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Участвуйте в турнирах</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Зарабатывайте PAC токены</span>
                </li>
              </ul>
              <Button variant="neon" className="w-full" onClick={() => setStep('form')}>
                Зарегистрироваться как игрок
              </Button>
            </CardContent>
          </Card>

          {/* Arena Owner Registration */}
          <Card glow className="glass border-purple-500/50 hover:border-purple-500 transition-all">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <WalletIcon size={32} className="text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Владелец арены</CardTitle>
              <CardDescription className="text-base">
                Расширенная регистрация с верификацией
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Создавайте и управляйте аренами</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Организуйте турниры</span>
                </li>
                <li className="text-sm flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  <span>Монетизируйте оборудование</span>
                </li>
              </ul>
              <Badge variant="secondary" className="mb-4">
                Требуется верификация личности и бизнеса
              </Badge>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/register/arena-owner">
                  Зарегистрироваться как владелец
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* OAuth Options */}
        <Card glow className="glass">
          <CardHeader>
            <CardTitle>Быстрая регистрация через соцсети</CardTitle>
            <CardDescription>OAuth провайдеры (будет реализовано с Supabase Auth)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="w-full"
              >
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Discord')}
                className="w-full"
              >
                Discord
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Twitch')}
                className="w-full"
              >
                Twitch
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Для России: Yandex, VK | Для Китая: WeChat, QQ
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="mt-8 text-center text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-cyan-400 hover:underline font-medium">
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
}
