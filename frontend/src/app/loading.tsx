export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          {/* Inner ring */}
          <div className="absolute inset-4 animate-spin-slow rounded-full border-4 border-secondary/20 border-t-secondary"></div>
          {/* Center glow */}
          <div className="absolute inset-8 animate-pulse rounded-full bg-gradient-to-r from-primary to-secondary opacity-50"></div>
        </div>

        {/* Loading text */}
        <h2 className="mb-2 text-2xl font-bold text-gradient-cyan-purple">
          Загрузка...
        </h2>
        <p className="text-sm text-muted-foreground">
          Подготовка контента
        </p>

        {/* Loading dots animation */}
        <div className="mt-4 flex justify-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
        </div>
      </div>
    </div>
  );
}
