'use client';

import { MOCK_EVENTS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArenaIcon, CoinsIcon, UsersIcon, BellIcon } from '@/components/ui/icons';

export function UpcomingEvents() {
  const events = MOCK_EVENTS.slice(0, 4);

  const formatPrize = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'championship':
        return 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-0';
      case 'tournament':
        return 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0';
      case 'special':
        return 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0';
      default:
        return 'bg-white/10 text-white border-0';
    }
  };

  const isToday = (timeString: string) => {
    return timeString.includes('TODAY');
  };

  const isTomorrow = (timeString: string) => {
    return timeString.includes('TOMORROW');
  };

  const getTimeHighlight = (timeString: string) => {
    if (isToday(timeString)) {
      return 'bg-cyan-600 text-white animate-pulse';
    }
    if (isTomorrow(timeString)) {
      return 'bg-purple-600 text-white';
    }
    return 'bg-cyan-600 text-white';
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Upcoming Events</h2>

      <div className="space-y-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className={`${getTimeHighlight(event.time)} px-4 py-2 rounded-lg flex-shrink-0 text-center min-w-[120px]`}>
                  <div className="text-xs font-bold uppercase opacity-80">
                    {event.time.split(' ')[0]}
                  </div>
                  <div className="text-sm font-bold">
                    {event.time.split(' ').slice(1).join(' ')}
                  </div>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg flex-1 group-hover:text-purple-300 transition-colors">
                      {event.title}
                    </h3>
                    <Badge className={`${getEventTypeColor(event.type)} text-xs uppercase font-bold flex-shrink-0`}>
                      {event.type}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-white/70 mb-3">
                    <div className="flex items-center gap-1">
                      <ArenaIcon className="text-cyan-400" size={16} />
                      <span>{event.arena}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CoinsIcon className="text-cyan-400" size={16} />
                      <span className="font-bold text-cyan-400">{formatPrize(event.prize)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="text-purple-400" size={16} />
                      <span>{event.playersRegistered} registered</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-xs px-4 py-2 h-9 border-0 font-semibold">
                      REGISTER
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs px-4 py-2 h-9 flex items-center gap-1">
                      <BellIcon size={14} />
                      NOTIFY ME
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View All Events Button */}
      <div className="mt-4 text-center">
        <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors">
          View All Events →
        </button>
      </div>
    </div>
  );
}
