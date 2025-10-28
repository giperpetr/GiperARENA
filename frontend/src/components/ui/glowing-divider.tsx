'use client';

import { cn } from '@/lib/utils';

interface GlowingDividerProps {
  className?: string;
  subtle?: boolean;
}

export function GlowingDivider({ className, subtle = false }: GlowingDividerProps) {
  if (subtle) {
    return (
      <div className={cn('relative w-full h-px', className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm" />
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-[3px] overflow-hidden my-8', className)}>
      {/* Base gradient line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent blur-md" />

      {/* Particles effect */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-75" />
        <div className="absolute left-3/4 top-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-150" />
      </div>

      {/* Moving glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}
