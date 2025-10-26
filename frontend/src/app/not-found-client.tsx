'use client';

import { Button } from '@/components/ui/button';

export function BackButton() {
  return (
    <Button
      variant="outline"
      className="flex-1"
      onClick={() => window.history.back()}
    >
      Назад
    </Button>
  );
}
