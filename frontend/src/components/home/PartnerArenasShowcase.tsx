'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArenaIcon, MapIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function PartnerArenasShowcase() {
  const partners = [
    { name: 'Tokyo Arena', emoji: '🇯🇵', city: 'Токио', devices: 24 },
    { name: 'NYC Robotics', emoji: '🇺🇸', city: 'Нью-Йорк', devices: 18 },
    { name: 'London Tech', emoji: '🇬🇧', city: 'Лондон', devices: 15 },
    { name: 'Berlin Drones', emoji: '🇩🇪', city: 'Берлин', devices: 21 },
    { name: 'Dubai Arena', emoji: '🇦🇪', city: 'Дубай', devices: 30 },
    { name: 'Moscow Robo', emoji: '🇷🇺', city: 'Москва', devices: 27 },
  ];

  return (
    <section className="relative px-6 py-20 border-t border-border/20">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <MapIcon size={32} className="text-cyan-400" />
            <h2 className="text-3xl lg:text-4xl font-bold">
              Наши <span className="text-gradient-cyan-purple">партнёрские арены</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Физические локации по всему миру, где находятся реальные устройства для удаленного управления
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {partners.map((partner, index) => (
            <Card
              key={index}
              className={cn(
                'group relative overflow-hidden',
                'bg-white/5 backdrop-blur-lg border-white/10',
                'hover:bg-white/10 hover:border-cyan-500/50',
                'transition-all duration-300 cursor-pointer',
                'transform hover:-translate-y-1'
              )}
            >
              <div className="p-6 text-center space-y-3">
                {/* Emoji flag */}
                <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {partner.emoji}
                </div>

                {/* City name */}
                <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                  {partner.city}
                </h3>

                {/* Devices count */}
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                  {partner.devices} устройств
                </Badge>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Map placeholder - you can integrate real map later */}
        <Card className="bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-lg border-white/10 mb-8">
          <div className="aspect-[21/9] flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapIcon size={64} className="text-cyan-400/50 mx-auto" />
              <p className="text-muted-foreground text-lg">Интерактивная карта скоро появится</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 hover:bg-white/10 font-bold px-8"
          >
            <ArenaIcon size={20} className="mr-2" />
            Стать партнёром
          </Button>
        </div>
      </div>
    </section>
  );
}
