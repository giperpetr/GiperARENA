'use client';

import { cn } from '@/lib/utils';

interface AnimatedGradientLineProps {
  className?: string;
}

export function AnimatedGradientLine({ className }: AnimatedGradientLineProps) {
  return (
    <div className={cn('relative w-full h-[2px] overflow-hidden', className)}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse-slow" />

      {/* Moving gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-shimmer" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm" />
    </div>
  );
}
