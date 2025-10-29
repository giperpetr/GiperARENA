'use client';

export default function NotFound() {
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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h1 style={{ fontSize: '48px', marginBottom: '16px', color: '#06b6d4' }}>
              404
            </h1>
            <p style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '24px' }}>
              Страница не найдена
            </p>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              Запрашиваемая страница не существует или была удалена.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#06b6d4',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                marginRight: '12px'
              }}
            >
              На главную
            </a>
            <button
              onClick={() => window.history.back()}
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
              Назад
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
