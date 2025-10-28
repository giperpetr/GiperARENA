'use client';

import { Button } from '@/components/ui/button';
import { RocketIcon, ArenaIcon } from '@/components/ui/icons';

export function FooterCTA() {
  const stats = [
    { value: '50K+', label: 'Игроков' },
    { value: '200+', label: 'Арен' },
    { value: '$2.5M', label: 'Выплачено' },
    { value: '24/7', label: 'Онлайн' },
  ];

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-pink-900/30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse-slow" />
      </div>

      <div className="container mx-auto max-w-5xl text-center">
        {/* Main heading */}
        <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          Готов к <span className="text-gradient-cyan-purple">приключениям</span>?
        </h2>

        <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Присоединяйся к тысячам игроков, которые уже управляют реальными устройствами и зарабатывают криптовалюту
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-10 py-6 text-lg"
          >
            <RocketIcon size={24} className="mr-2" />
            Создать аккаунт
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/20 hover:bg-white/10 font-bold px-10 py-6 text-lg"
          >
            <ArenaIcon size={24} className="mr-2" />
            Посмотреть арены
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
