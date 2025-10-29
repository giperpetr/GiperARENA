'use client';

import { useEffect, useState } from 'react';
import { CoinsIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export function TokenPricesWidget() {
  const [token, setToken] = useState({
    symbol: 'GAC',
    price: 2.45,
    change24h: 5.67,
  });

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setToken((prev) => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.01,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.1,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 left-6 z-40',
        'bg-black/80 backdrop-blur-xl border border-white/10',
        'rounded-lg shadow-2xl',
        'hover:bg-black/90 hover:border-white/20',
        'transition-all duration-300',
        'group cursor-pointer'
      )}
    >
      <div className="p-3 flex items-center gap-3 min-w-[180px]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
          <CoinsIcon size={16} className="text-cyan-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-white/70">{token.symbol}</span>
            <span className="text-sm font-bold text-white">${formatPrice(token.price)}</span>
          </div>
          <p
            className={cn(
              'text-xs font-semibold',
              token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {formatChange(token.change24h)}
          </p>
        </div>
      </div>
    </div>
  );
}
