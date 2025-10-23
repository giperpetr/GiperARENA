'use client';


import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

const MOCK_NFTS: NFT[] = [
  {
    id: '1',
    name: 'Tokyo Cyber Drone #42',
    description: 'Legendary racing drone from Tokyo Arena. 156 wins, 89% win rate.',
    image: '🚁',
    type: 'device',
    rarity: 'legendary',
    price: 2500,
    seller: '0x1234...5678',
    status: 'listed',
    stats: {
      wins: 156,
      games_played: 175,
      arena: 'Tokyo Cyber Arena',
    },
  },
  {
    id: '2',
    name: 'Champion Achievement Badge',
    description: 'Earned by winning 100+ games in a single arena.',
    image: '🏆',
    type: 'achievement',
    rarity: 'epic',
    price: 800,
    seller: '0xabcd...efgh',
    status: 'listed',
  },
  {
    id: '3',
    name: 'Neon Skin Pack',
    description: 'Exclusive cyan-purple neon skin for all devices.',
    image: '🎨',
    type: 'skin',
    rarity: 'rare',
    price: 450,
    seller: '0x9876...5432',
    status: 'listed',
  },
  {
    id: '4',
    name: 'Arena Founder Card',
    description: 'Limited edition founder collectible. Only 100 exist.',
    image: '🎴',
    type: 'collectible',
    rarity: 'legendary',
    price: 5000,
    seller: '0xffff...0000',
    status: 'listed',
  },
  {
    id: '5',
    name: 'Battle Robot MK-7',
    description: 'Heavy combat robot with reinforced armor. 45 arena wins.',
    image: '🤖',
    type: 'device',
    rarity: 'epic',
    price: 1800,
    seller: '0x5555...aaaa',
    status: 'listed',
    stats: {
      wins: 45,
      games_played: 67,
      arena: 'Berlin Battle Zone',
    },
  },
  {
    id: '6',
    name: 'Speed Demon Skin',
    description: 'Fire-themed skin with particle effects.',
    image: '🔥',
    type: 'skin',
    rarity: 'rare',
    price: 350,
    seller: '0x1111...2222',
    status: 'listed',
  },
  {
    id: '7',
    name: 'First Blood Achievement',
    description: 'Awarded for winning first game in any arena.',
    image: '⚡',
    type: 'achievement',
    rarity: 'common',
    price: 150,
    seller: '0x3333...4444',
    status: 'listed',
  },
  {
    id: '8',
    name: 'Galaxy Drone Limited',
    description: 'Space-themed drone with cosmic trail effects.',
    image: '🌌',
    type: 'device',
    rarity: 'legendary',
    price: 3200,
    seller: '0x7777...8888',
    status: 'listed',
    stats: {
      wins: 203,
      games_played: 245,
      arena: 'Moscow Sky Arena',
    },
  },
  {
    id: '9',
    name: 'Veteran Collectible',
    description: 'Exclusive card for players with 1000+ games.',
    image: '💎',
    type: 'collectible',
    rarity: 'epic',
    price: 1200,
    seller: '0x9999...0000',
    status: 'listed',
  },
];

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

  // Filter NFTs
  const filteredNFTs = MOCK_NFTS.filter((nft) => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || nft.type === selectedType;
    const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity;
    const matchesPrice = nft.price >= priceRange.min && nft.price <= priceRange.max;

    return matchesSearch && matchesType && matchesRarity && matchesPrice;
  });

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rarity':
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
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
              <CardTitle className="text-3xl font-bold text-primary">
                {MOCK_NFTS.length}
              </CardTitle>
              <CardDescription>Всего NFT</CardDescription>
            </CardHeader>
          </Card>
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-secondary">
                $2.5M
              </CardTitle>
              <CardDescription>Объем торгов</CardDescription>
            </CardHeader>
          </Card>
          <Card glow className="glass">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-neon-cyan">
                1,234
              </CardTitle>
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

          {sortedNFTs.length === 0 ? (
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
              {sortedNFTs.map((nft) => (
                <Card key={nft.id} glow className="hover-lift">
                  <CardHeader>
                    {/* Image */}
                    <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-space-medium-gray text-8xl">
                      {nft.image}
                    </div>

                    {/* Type & Rarity Badges */}
                    <div className="mb-2 flex gap-2">
                      <Badge variant="outline">
                        {TYPE_ICONS[nft.type]} {nft.type === 'device' ? 'Устройство' : nft.type === 'achievement' ? 'Достижение' : nft.type === 'collectible' ? 'Коллекционное' : 'Скин'}
                      </Badge>
                      <Badge className={RARITY_COLORS[nft.rarity]}>
                        {nft.rarity === 'common' ? 'Обычный' : nft.rarity === 'rare' ? 'Редкий' : nft.rarity === 'epic' ? 'Эпический' : 'Легендарный'}
                      </Badge>
                    </div>

                    <CardTitle>{nft.name}</CardTitle>
                    <CardDescription>{nft.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Stats for devices */}
                    {nft.stats && (
                      <div className="mb-4 space-y-2 rounded-lg bg-space-dark-gray/50 p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Побед:</span>
                          <span className="font-medium text-primary">{nft.stats.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Игр:</span>
                          <span className="font-medium">{nft.stats.games_played}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win rate:</span>
                          <span className="font-medium text-secondary">
                            {nft.stats.wins && nft.stats.games_played
                              ? `${Math.round((nft.stats.wins / nft.stats.games_played) * 100)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Seller */}
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Продавец:</span>
                      <code className="rounded bg-space-dark-gray px-2 py-1 text-xs">
                        {nft.seller}
                      </code>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                      <span className="text-sm text-muted-foreground">Цена:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {nft.price.toLocaleString()} PAC
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ ${(nft.price * 0.5).toLocaleString()}
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
            <Button variant="outline">Создать листинг</Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Example owned NFTs */}
            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-space-medium-gray text-6xl">
                  🎮
                </div>
                <CardTitle className="text-base">Starter Drone #123</CardTitle>
                <CardDescription className="text-xs">Твой первый дрон</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Выставить на продажу
                </Button>
              </CardFooter>
            </Card>

            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-space-medium-gray text-6xl">
                  🏅
                </div>
                <CardTitle className="text-base">Rookie Badge</CardTitle>
                <CardDescription className="text-xs">Первые 10 побед</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Выставить на продажу
                </Button>
              </CardFooter>
            </Card>

            <Card glow className="hover-lift">
              <CardHeader>
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-space-medium-gray text-6xl">
                  ✨
                </div>
                <CardTitle className="text-base">Blue Skin</CardTitle>
                <CardDescription className="text-xs">Стандартный скин</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Выставить на продажу
                </Button>
              </CardFooter>
            </Card>

            {/* Add more card */}
            <Card glow className="hover-lift flex items-center justify-center border-dashed">
              <CardContent className="text-center">
                <div className="text-6xl mb-2">➕</div>
                <p className="text-sm text-muted-foreground">Купи больше NFT</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
