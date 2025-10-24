import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card glow className="glass max-w-md text-center">
        <CardHeader>
          {/* 404 icon */}
          <div className="mx-auto mb-4 text-8xl">🔍</div>
          <CardTitle className="text-6xl font-bold text-gradient-cyan-purple mb-4">
            404
          </CardTitle>
          <CardDescription className="text-xl">
            Страница не найдена
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            Запрашиваемая страница не существует или была удалена.
            Проверьте URL или вернитесь на главную страницу.
          </p>

          {/* Quick links */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Link href="/arenas" className="rounded-lg border border-border/40 p-3 hover:border-primary/30 transition-colors">
              <div className="text-2xl mb-1">🏟️</div>
              <div className="font-medium">Арены</div>
            </Link>
            <Link href="/tournaments" className="rounded-lg border border-border/40 p-3 hover:border-primary/30 transition-colors">
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-medium">Турниры</div>
            </Link>
            <Link href="/marketplace" className="rounded-lg border border-border/40 p-3 hover:border-primary/30 transition-colors">
              <div className="text-2xl mb-1">🎴</div>
              <div className="font-medium">NFT</div>
            </Link>
            <Link href="/leaderboard" className="rounded-lg border border-border/40 p-3 hover:border-primary/30 transition-colors">
              <div className="text-2xl mb-1">📊</div>
              <div className="font-medium">Рейтинг</div>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          <Button
            variant="neon"
            className="flex-1"
            asChild
          >
            <Link href="/">
              На главную
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            Назад
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
