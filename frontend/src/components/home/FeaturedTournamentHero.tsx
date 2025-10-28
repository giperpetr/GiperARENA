'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrophyIcon,
  UsersIcon,
  CoinsIcon,
  ClockIcon,
  PlayIcon,
  RocketIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function FeaturedTournamentHero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  const [participantsCount, setParticipantsCount] = useState(1247);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate new participants
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipantsCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <section className="relative px-6 py-16 overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse-slow" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
            {/* Left side - Tournament info */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1.5 text-sm font-bold">
                  FEATURED TOURNAMENT
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">РЕГИСТРАЦИЯ ОТКРЫТА</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                <span className="text-gradient-cyan-purple">
                  Grand Championship
                </span>
                <br />
                <span className="text-white">Robot Battle Royale</span>
              </h2>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                Соревнуйтесь с лучшими пилотами в эпичной битве роботов за главный приз сезона
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <CoinsIcon size={20} className="text-cyan-400" />
                    <span className="text-sm text-muted-foreground">Приз</span>
                  </div>
                  <span className="text-2xl font-bold text-white">$50,000</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon size={20} className="text-purple-400" />
                    <span className="text-sm text-muted-foreground">Игроков</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{participantsCount}</span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <TrophyIcon size={20} className="text-pink-400" />
                    <span className="text-sm text-muted-foreground">Формат</span>
                  </div>
                  <span className="text-2xl font-bold text-white">128</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8"
                >
                  <RocketIcon size={20} className="mr-2" />
                  Зарегистрироваться
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 font-bold"
                >
                  <PlayIcon size={20} className="mr-2" />
                  Подробнее
                </Button>
              </div>
            </div>

            {/* Right side - Countdown timer */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Timer label */}
                <div className="text-center mb-6">
                  <ClockIcon size={32} className="inline-block text-cyan-400 mb-2" />
                  <p className="text-lg text-muted-foreground font-semibold">До начала осталось:</p>
                </div>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: timeLeft.days, label: 'Дней' },
                    { value: timeLeft.hours, label: 'Часов' },
                    { value: timeLeft.minutes, label: 'Минут' },
                    { value: timeLeft.seconds, label: 'Секунд' },
                  ].map((unit, index) => (
                    <div
                      key={index}
                      className={cn(
                        'relative overflow-hidden',
                        'bg-gradient-to-br from-white/10 to-white/5',
                        'backdrop-blur-lg border border-white/20',
                        'rounded-xl p-4',
                        'transform hover:scale-105 transition-all duration-300'
                      )}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative text-center">
                        <div className="text-3xl lg:text-4xl font-bold text-white mb-1 font-mono">
                          {formatNumber(unit.value)}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                          {unit.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Мест занято</span>
                    <span>{participantsCount} / 2048</span>
                  </div>
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${(participantsCount / 2048) * 100}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent" />
        </Card>
      </div>
    </section>
  );
}
