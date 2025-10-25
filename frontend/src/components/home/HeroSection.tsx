'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { PlayIcon, RocketIcon, EyeIcon, GamepadIcon, TrophyIcon } from '@/components/ui/icons';
import Image from 'next/image';

export function HeroSection() {
  const [stats, setStats] = useState({
    playersOnline: 47234,
    gamesLive: 156,
    prizePools: 2500000,
  });

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        playersOnline: prev.playersOnline + Math.floor(Math.random() * 20 - 10),
        gamesLive: prev.gamesLive + Math.floor(Math.random() * 5 - 2),
        prizePools: prev.prizePools,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden px-6 py-20">
      {/* Subtle Background Grid */}
      <div className="grid-bg absolute inset-0 -z-10 opacity-20" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center justify-center">
          <Image
            src="/logo-full.svg"
            alt="GiperARENA"
            width={320}
            height={80}
            className="h-20 w-auto opacity-90"
            priority
          />
        </div>

        {/* Main Tagline */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Управляй{' '}
          <span className="text-gradient-cyan-purple">реальными роботами</span>
          <br />
          из любой точки мира
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Платформа для удаленного управления дронами, роботами и машинами в физических аренах.
          Соревнуйся в турнирах, зарабатывай криптовалюту, торгуй NFT.
        </p>

        {/* Live Badge */}
        <div className="inline-flex items-center space-x-2 mb-10 glass px-5 py-2.5 rounded-full border border-cyan-500/30">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-sm font-semibold text-cyan-400">LIVE</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-semibold">{formatNumber(stats.gamesLive)} активных игр</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Button size="xl" variant="neon" className="gap-2 px-8">
            <RocketIcon size={20} />
            Начать играть
          </Button>
          <Button size="xl" variant="outline" className="gap-2 px-8">
            <PlayIcon size={20} />
            Смотреть трансляции
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {/* Players Online */}
          <div className="glass rounded-xl p-6 border border-border/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600/20 to-cyan-400/20 flex items-center justify-center">
                <GamepadIcon className="text-cyan-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatNumber(stats.playersOnline)}
            </div>
            <div className="text-sm text-muted-foreground">Игроков онлайн</div>
          </div>

          {/* Games Live */}
          <div className="glass rounded-xl p-6 border border-border/50 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-purple-400/20 flex items-center justify-center">
                <EyeIcon className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatNumber(stats.gamesLive)}
            </div>
            <div className="text-sm text-muted-foreground">Игр прямо сейчас</div>
          </div>

          {/* Prize Pools */}
          <div className="glass rounded-xl p-6 border border-border/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600/20 to-purple-600/20 flex items-center justify-center">
                <TrophyIcon className="text-cyan-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gradient-cyan-purple mb-1">
              {formatCurrency(stats.prizePools)}
            </div>
            <div className="text-sm text-muted-foreground">Призовой фонд</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span>Реальное время &lt;100ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>Блокчейн Solana</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span>24/7 поддержка</span>
          </div>
        </div>
      </div>
    </section>
  );
}
