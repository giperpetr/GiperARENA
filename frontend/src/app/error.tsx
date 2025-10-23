'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card glow className="glass max-w-md">
        <CardHeader className="text-center">
          {/* Error icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-5xl">
            ⚠️
          </div>
          <CardTitle className="text-2xl text-red-500">
            Что-то пошло не так
          </CardTitle>
          <CardDescription>
            Произошла непредвиденная ошибка
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error details */}
          <div className="rounded-lg border border-border/40 bg-space-dark-gray/50 p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Детали ошибки:
            </div>
            <code className="text-xs text-red-400 break-all">
              {error.message || 'Unknown error'}
            </code>
            {error.digest && (
              <div className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Попробуйте:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Перезагрузить страницу</li>
              <li>Очистить кеш браузера</li>
              <li>Проверить подключение к интернету</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          <Button
            variant="neon"
            className="flex-1"
            onClick={() => reset()}
          >
            Попробовать снова
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.location.href = '/'}
          >
            На главную
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
