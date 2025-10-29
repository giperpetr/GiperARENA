'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.05)',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#ef4444' }}>
              Критическая ошибка
            </h1>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
              Произошла непредвиденная ошибка приложения
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <code style={{ fontSize: '12px', color: '#ef4444', wordBreak: 'break-all' }}>
                {error.message || 'Unknown error'}
              </code>
              {error.digest && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                  Error ID: {error.digest}
                </div>
              )}
            </div>
            <button
              onClick={() => reset()}
              style={{
                padding: '12px 24px',
                background: '#06b6d4',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '12px'
              }}
            >
              Попробовать снова
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              На главную
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
