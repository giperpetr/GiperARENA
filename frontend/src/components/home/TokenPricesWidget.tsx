'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoinsIcon, TrendingUpIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export function TokenPricesWidget() {
  const [tokens, setTokens] = useState<TokenData[]>([
    {
      symbol: 'GAC',
      name: 'Government Arena Coin',
      price: 2.45,
      change24h: 5.67,
      sparkline: [2.3, 2.35, 2.32, 2.4, 2.38, 2.45, 2.42, 2.48, 2.45],
    },
    {
      symbol: 'PAC',
      name: 'Play Arena Coin',
      price: 0.87,
      change24h: -2.34,
      sparkline: [0.9, 0.89, 0.88, 0.86, 0.87, 0.85, 0.86, 0.88, 0.87],
    },
  ]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) =>
        prev.map((token) => ({
          ...token,
          price: token.price + (Math.random() - 0.5) * 0.01,
          change24h: token.change24h + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-white/90">💎 Курсы токенов</h3>

      <div className="space-y-3">
        {tokens.map((token) => (
          <Card
            key={token.symbol}
            className={cn(
              'group',
              'bg-white/5 backdrop-blur-lg border-white/10',
              'hover:bg-white/10 hover:border-white/20',
              'transition-all duration-300'
            )}
          >
            <div className="p-4 space-y-3">
              {/* Token header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                    <CoinsIcon size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{token.symbol}</h4>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">${formatPrice(token.price)}</p>
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

              {/* Mini sparkline chart */}
              <div className="h-12 flex items-end gap-0.5">
                {token.sparkline.map((value, index) => {
                  const maxValue = Math.max(...token.sparkline);
                  const minValue = Math.min(...token.sparkline);
                  const height = ((value - minValue) / (maxValue - minValue)) * 100;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex-1 rounded-t transition-all duration-300',
                        token.change24h >= 0
                          ? 'bg-gradient-to-t from-green-500/50 to-green-400'
                          : 'bg-gradient-to-t from-red-500/50 to-red-400'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
      >
        <CoinsIcon size={18} className="mr-2" />
        Купить токены
      </Button>
    </div>
  );
}
