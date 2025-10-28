'use client';

import { Card } from '@/components/ui/card';
import { ArenaIcon, GamepadIcon, TrophyIcon, CoinsIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: <ArenaIcon size={32} className="text-cyan-400" />,
      title: 'Выбери арену',
      description: 'Исследуй доступные арены по всему миру с различными устройствами и играми',
      color: 'from-cyan-500/20 to-cyan-600/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      number: 2,
      icon: <GamepadIcon size={32} className="text-purple-400" />,
      title: 'Управляй устройством',
      description: 'Получи удаленный доступ к реальному роботу, дрону или машине через браузер',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      number: 3,
      icon: <TrophyIcon size={32} className="text-pink-400" />,
      title: 'Соревнуйся и выигрывай',
      description: 'Участвуй в турнирах, поднимайся в рейтинге и зарабатывай достижения',
      color: 'from-pink-500/20 to-pink-600/20',
      borderColor: 'border-pink-500/30',
    },
    {
      number: 4,
      icon: <CoinsIcon size={32} className="text-blue-400" />,
      title: 'Забирай награды',
      description: 'Получай криптовалюту GAC/PAC за победы и обменивай на реальные деньги',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
    },
  ];

  return (
    <section className="relative px-6 py-20">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Как это <span className="text-gradient-cyan-purple">работает</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Всего 4 простых шага отделяют тебя от управления реальными устройствами
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              className={cn(
                'group relative overflow-hidden',
                'bg-white/5 backdrop-blur-lg border-white/10',
                'hover:bg-white/10 transition-all duration-500',
                'transform hover:-translate-y-2'
              )}
            >
              {/* Gradient background on hover */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                step.color
              )} />

              {/* Connecting line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent z-10" />
              )}

              <div className="relative p-6">
                {/* Step number badge */}
                <div className={cn(
                  'absolute top-4 right-4',
                  'w-10 h-10 rounded-full',
                  'bg-gradient-to-br',
                  step.color,
                  'flex items-center justify-center',
                  'font-bold text-white text-lg',
                  'border-2',
                  step.borderColor
                )}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
