'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

type NFTRarity = 'common' | 'rare' | 'epic' | 'legendary';
type NFTType = 'device' | 'achievement' | 'collectible' | 'skin';
type NFTStatus = 'listed' | 'sold' | 'owned';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  type: NFTType;
  rarity: NFTRarity;
  price: number; // PAC tokens
  seller: string;
  status: NFTStatus;
  stats?: {
    wins?: number;
    games_played?: number;
    arena?: string;
  };
}


const RARITY_COLORS: Record<NFTRarity, string> = {
  common: 'bg-space-light-gray/10 text-space-light-gray border-space-light-gray',
  rare: 'bg-neon-blue/10 text-neon-blue border-neon-blue',
  epic: 'bg-neon-purple/10 text-neon-purple border-neon-purple',
  legendary: 'bg-neon-pink/10 text-neon-pink border-neon-pink',
};

const TYPE_ICONS: Record<NFTType, string> = {
  device: '🚁',
  achievement: '🏆',
  collectible: '🎴',
  skin: '🎨',
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NFTType | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<NFTRarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rarity' | 'recent'>('recent');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  // Fetch current user (optional for My NFTs section)
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response: any = await api.getCurrentUser();
        return response.data || response;
      } catch {
        return null;
      }
    },
  });

  // Fetch all marketplace NFTs
  const { data: marketplaceNFTs = [], isLoading: loadingMarketplace } = useQuery({
    queryKey: ['nfts', 'marketplace'],
    queryFn: async () => {
      const response = await fetch('https://api.giperarena.space/api/v1/nfts?status=listed');
      if (!response.ok) return [];
      const json = await response.json();
      return (json.data || json || []) as NFT[];
    },
  });

  // Fetch user's NFTs
  const { data: myNFTs = [], isLoading: loadingMyNFTs } = useQuery({
    queryKey: ['nfts', 'my', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response: any = await api.getUserNFTs(user.id);
      return (response.data || response || []) as NFT[];
    },
    enabled: !!user?.id,
  });

  // Filter NFTs
  const filteredNFTs = marketplaceNFTs.filter((nft: any) => {
    const matchesSearch = nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || nft.nft_type === selectedType;
    const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity;
    const matchesPrice = (nft.price || 0) >= priceRange.min && (nft.price || 0) <= priceRange.max;

    return matchesSearch && matchesType && matchesRarity && matchesPrice;
  });

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'rarity':
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        return rarityOrder[b.rarity as NFTRarity] - rarityOrder[a.rarity as NFTRarity];
      case 'recent':
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-gradient-cyan-purple">NFT Маркетплейс</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Покупай и продавай уникальные игровые NFT
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card glow className="glass">
            <CardHeader>
              {loadingMarketplace ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <CardTitle className="text-3xl font-bold text-primary">
                  {marketplaceNFTs.length}
                </CardTitle>
              )}
              <CardDescription>Всего NFT</CardDescription>
            </CardHeader>
          </Card>
          <Card glow className="glass">
            <CardHeader>
              {loadingMarketplace ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <CardTitle className="text-3xl font-bold text-secondary">
                  {((marketplaceNFTs as any[]).reduce((sum, nft) => sum + (nft.price || 0), 0) * 0.5 / 1000).toFixed(1)}K
                </CardTitle>
              )}
              <CardDescription>Объем торгов (PAC)</CardDescription>
            </CardHeader>
          </Card>
          <Card glow className="glass">
            <CardHeader>
              {loadingMarketplace ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <CardTitle className="text-3xl font-bold text-neon-cyan">
                  {(marketplaceNFTs as any[]).filter((nft: any) => nft.status === 'listed').length}
                </CardTitle>
              )}
              <CardDescription>Активных листингов</CardDescription>
            </CardHeader>
          </Card>
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-neon-pink">
                5%
              </CardTitle>
              <CardDescription>Комиссия маркетплейса</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card glow className="glass mb-8">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">Поиск</label>
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Тип NFT</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === 'all' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  Все
                </Button>
                {(['device', 'achievement', 'collectible', 'skin'] as NFTType[]).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'neon' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {TYPE_ICONS[type]} {type === 'device' ? 'Устройства' : type === 'achievement' ? 'Достижения' : type === 'collectible' ? 'Коллекционные' : 'Скины'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Редкость</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRarity === 'all' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('all')}
                >
                  Все
                </Button>
                {(['common', 'rare', 'epic', 'legendary'] as NFTRarity[]).map((rarity) => (
                  <Button
                    key={rarity}
                    variant={selectedRarity === rarity ? 'neon' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRarity(rarity)}
                  >
                    {rarity === 'common' ? 'Обычные' : rarity === 'rare' ? 'Редкие' : rarity === 'epic' ? 'Эпические' : 'Легендарные'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Диапазон цен (PAC): {priceRange.min} - {priceRange.max}
              </label>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Мин"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Макс"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm font-medium">Сортировка</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Недавние
                </Button>
                <Button
                  variant={sortBy === 'price_asc' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('price_asc')}
                >
                  Цена ↑
                </Button>
                <Button
                  variant={sortBy === 'price_desc' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('price_desc')}
                >
                  Цена ↓
                </Button>
                <Button
                  variant={sortBy === 'rarity' ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rarity')}
                >
                  Редкость
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Найдено NFT: <span className="text-primary">{sortedNFTs.length}</span>
            </h2>
          </div>

          {loadingMarketplace ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} glow>
                  <CardHeader>
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedNFTs.length === 0 ? (
            <Card glow className="glass text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl text-muted-foreground">
                  NFT не найдено. Попробуйте изменить фильтры.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedNFTs.map((nft: any) => (
                <Card key={nft.id} glow className="hover-lift">
                  <CardHeader>
                    {/* Image */}
                    <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-space-medium-gray text-8xl">
                      {nft.metadata?.image || TYPE_ICONS[nft.nft_type as NFTType] || '🎮'}
                    </div>

                    {/* Type & Rarity Badges */}
                    <div className="mb-2 flex gap-2">
                      <Badge variant="outline">
                        {TYPE_ICONS[nft.nft_type as NFTType] || '🎮'} {nft.nft_type === 'device' ? 'Устройство' : nft.nft_type === 'achievement' ? 'Достижение' : nft.nft_type === 'collectible' ? 'Коллекционное' : 'Скин'}
                      </Badge>
                      <Badge className={RARITY_COLORS[nft.rarity as NFTRarity] || ''}>
                        {nft.rarity === 'common' ? 'Обычный' : nft.rarity === 'rare' ? 'Редкий' : nft.rarity === 'epic' ? 'Эпический' : 'Легендарный'}
                      </Badge>
                    </div>

                    <CardTitle>{nft.name || 'Unnamed NFT'}</CardTitle>
                    <CardDescription>{nft.description || 'No description'}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Stats for devices */}
                    {nft.metadata?.stats && (
                      <div className="mb-4 space-y-2 rounded-lg bg-space-dark-gray/50 p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Побед:</span>
                          <span className="font-medium text-primary">{nft.metadata.stats.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Игр:</span>
                          <span className="font-medium">{nft.metadata.stats.games_played}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win rate:</span>
                          <span className="font-medium text-secondary">
                            {nft.metadata.stats.wins && nft.metadata.stats.games_played
                              ? `${Math.round((nft.metadata.stats.wins / nft.metadata.stats.games_played) * 100)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Seller */}
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Продавец:</span>
                      <code className="rounded bg-space-dark-gray px-2 py-1 text-xs">
                        {nft.owner_id ? `${nft.owner_id.slice(0, 6)}...${nft.owner_id.slice(-4)}` : 'Unknown'}
                      </code>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                      <span className="text-sm text-muted-foreground">Цена:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {(nft.price || 0).toLocaleString()} PAC
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ ${((nft.price || 0) * 0.5).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button variant="neon" className="w-full">
                      Купить NFT
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* My NFTs Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Мои NFT</h2>
            {user && <Button variant="outline">Создать листинг</Button>}
          </div>

          {!user ? (
            <Card glow className="glass text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🔐</div>
                <p className="text-xl text-muted-foreground mb-4">
                  Войдите, чтобы увидеть свои NFT
                </p>
                <Button variant="neon" onClick={() => (window.location.href = '/auth/login')}>
                  Войти
                </Button>
              </CardContent>
            </Card>
          ) : loadingMyNFTs ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} glow>
                  <CardHeader>
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : myNFTs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {myNFTs.slice(0, 4).map((nft: any) => (
                <Card key={nft.id} glow className="hover-lift">
                  <CardHeader>
                    <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-space-medium-gray text-6xl">
                      {nft.metadata?.image || TYPE_ICONS[nft.nft_type as NFTType] || '🎮'}
                    </div>
                    <CardTitle className="text-base">{nft.name || 'Unnamed NFT'}</CardTitle>
                    <CardDescription className="text-xs">{nft.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Выставить на продажу
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {/* Add more card */}
              {myNFTs.length < 4 && (
                <Card glow className="hover-lift flex items-center justify-center border-dashed">
                  <CardContent className="text-center">
                    <div className="text-6xl mb-2">➕</div>
                    <p className="text-sm text-muted-foreground">Купи больше NFT</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card glow className="glass text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl text-muted-foreground mb-4">
                  У вас пока нет NFT
                </p>
                <Button variant="neon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Купить NFT
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
