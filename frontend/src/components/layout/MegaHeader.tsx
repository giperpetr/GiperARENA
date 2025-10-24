'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArenaIcon,
  GamepadIcon,
  TrophyIcon,
  ClockIcon,
  PlayIcon,
  EyeIcon,
  FireIcon,
  UsersIcon,
  CoinsIcon,
  BellIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  WalletIcon,
  LogOutIcon,
  ChevronDownIcon
} from '@/components/ui/icons';

export function MegaHeader() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showBrowseMenu, setShowBrowseMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover-lift">
          <Image
            src="/logo-full.svg"
            alt="GiperARENA"
            width={180}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Browse Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowBrowseMenu(!showBrowseMenu)}
            className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-cyan-400 transition-colors"
          >
            <span>Browse</span>
            <ChevronDownIcon size={14} />
          </button>

          {showBrowseMenu && (
            <div className="absolute left-0 top-full mt-2 w-64 glass border border-border/50 rounded-lg p-4 shadow-xl">
              <div className="space-y-4">
                {/* Discover Section */}
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 mb-2">DISCOVER</h4>
                  <div className="space-y-1">
                    <Link
                      href="/discover/arenas"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <ArenaIcon size={16} />
                      Arenas
                    </Link>
                    <Link
                      href="/discover/games"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <GamepadIcon size={16} />
                      Games
                    </Link>
                    <Link
                      href="/tournaments"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <TrophyIcon size={16} />
                      Tournaments
                    </Link>
                  </div>
                </div>

                {/* Play Section */}
                <div>
                  <h4 className="text-xs font-bold text-purple-400 mb-2">PLAY</h4>
                  <div className="space-y-1">
                    <Link
                      href="/play/queue"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-purple-500/10 hover:text-purple-400 rounded transition-colors"
                    >
                      <ClockIcon size={16} />
                      Queue
                    </Link>
                    <Link
                      href="/play/live"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-purple-500/10 hover:text-purple-400 rounded transition-colors"
                    >
                      <PlayIcon size={16} />
                      Live Games
                    </Link>
                  </div>
                </div>

                {/* Streams Section */}
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 mb-2">STREAMS</h4>
                  <div className="space-y-1">
                    <Link
                      href="/streams/live"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <EyeIcon size={16} />
                      Live Streams
                    </Link>
                    <Link
                      href="/streams/highlights"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <FireIcon size={16} />
                      Highlights
                    </Link>
                  </div>
                </div>

                {/* Community Section */}
                <div>
                  <h4 className="text-xs font-bold text-purple-400 mb-2">COMMUNITY</h4>
                  <div className="space-y-1">
                    <Link
                      href="/leaderboard"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-purple-500/10 hover:text-purple-400 rounded transition-colors"
                    >
                      <TrophyIcon size={16} />
                      Leaderboards
                    </Link>
                    <Link
                      href="/community/groups"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-purple-500/10 hover:text-purple-400 rounded transition-colors"
                    >
                      <UsersIcon size={16} />
                      Groups
                    </Link>
                  </div>
                </div>

                {/* Marketplace Section */}
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 mb-2">MARKETPLACE</h4>
                  <div className="space-y-1">
                    <Link
                      href="/marketplace"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                    >
                      <CoinsIcon size={16} />
                      NFT
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div
            className={`relative w-full transition-all duration-200 ${
              isSearchFocused ? 'ring-2 ring-cyan-500/50' : ''
            }`}
          >
            <input
              type="text"
              placeholder="Search arenas, players, tournaments..."
              className="w-full h-10 pl-10 pr-4 bg-space-medium-gray/40 border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon size={16} />
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative hover-lift">
            <BellIcon className="text-muted-foreground hover:text-cyan-400 transition-colors" size={20} />
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-cyan-500 hover:bg-cyan-500"
            >
              3
            </Badge>
          </button>

          {/* Wallet Balance */}
          <Link href="/wallet">
            <div className="hidden lg:flex items-center space-x-2 glass rounded-lg px-3 py-1.5 hover:border-cyan-500/30 transition-colors cursor-pointer">
              <Badge variant="default" className="text-xs bg-gradient-to-r from-cyan-600 to-purple-600">
                PAC
              </Badge>
              <span className="text-sm font-bold">1,234.56</span>
            </div>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 hover-lift"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center text-sm">
                <UserIcon size={18} className="text-white" />
              </div>
              <span className="hidden sm:inline">
                <ChevronDownIcon size={14} />
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass border border-border/50 rounded-lg p-2 shadow-xl">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                >
                  <UserIcon size={16} />
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                >
                  <SettingsIcon size={16} />
                  Settings
                </Link>
                <Link
                  href="/wallet"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors"
                >
                  <WalletIcon size={16} />
                  Wallet
                </Link>
                <hr className="my-2 border-border/50" />
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 hover:text-destructive rounded transition-colors">
                  <LogOutIcon size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Connect Wallet Button */}
          <Button variant="neon" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/auth/login">Connect Wallet</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-border/40 px-4 py-2 flex justify-around">
        <Link href="/discover/arenas" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400">
          <ArenaIcon size={18} />
          <span>Arenas</span>
        </Link>
        <Link href="/tournaments" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400">
          <TrophyIcon size={18} />
          <span>Tournaments</span>
        </Link>
        <Link href="/marketplace" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400">
          <CoinsIcon size={18} />
          <span>NFT</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400">
          <TrophyIcon size={18} />
          <span>Rank</span>
        </Link>
      </div>
    </header>
  );
}
