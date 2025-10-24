'use client';

import Link from 'next/link';
import Image from 'next/image';

export function RichFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-space-dark-gray/50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {/* Discover Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-primary">DISCOVER</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/arenas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Arenas
                </Link>
              </li>
              <li>
                <Link href="/discover/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/discover/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Play Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-secondary">PLAY</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/play/queue" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Queue
                </Link>
              </li>
              <li>
                <Link href="/play/live" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Live Games
                </Link>
              </li>
              <li>
                <Link href="/play/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Games
                </Link>
              </li>
              <li>
                <Link href="/tournaments/my-tournaments" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Tournaments
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-neon-purple">COMMUNITY</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/community/players" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/community/groups" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Groups
                </Link>
              </li>
              <li>
                <Link href="/community/forum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Forum
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-neon-pink">MARKETPLACE</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  NFT Equipment
                </Link>
              </li>
              <li>
                <Link href="/marketplace/items" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Items
                </Link>
              </li>
              <li>
                <Link href="/marketplace/my-inventory" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Inventory
                </Link>
              </li>
              <li>
                <Link href="/marketplace/trading" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Trading
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-neon-cyan">GOVERNANCE</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/governance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  DAO
                </Link>
              </li>
              <li>
                <Link href="/governance/proposals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Proposals
                </Link>
              </li>
              <li>
                <Link href="/governance/voting" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Voting
                </Link>
              </li>
              <li>
                <Link href="/governance/treasury" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Treasury
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-neon-blue">RESOURCES</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 mb-8"></div>

        {/* Social Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground">Follow us:</span>
            <a
              href="https://twitter.com/giperarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              🐦 Twitter
            </a>
            <a
              href="https://discord.gg/giperarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              💬 Discord
            </a>
            <a
              href="https://twitch.tv/giperarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              📺 Twitch
            </a>
            <a
              href="https://youtube.com/@giperarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              🎥 YouTube
            </a>
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} GiperARENA. All rights reserved.</span>
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center opacity-50 hover:opacity-100 transition-opacity">
            <Image
              src="/logo-full.svg"
              alt="GiperARENA"
              width={160}
              height={36}
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
