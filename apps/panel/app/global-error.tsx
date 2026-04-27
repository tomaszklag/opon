'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0B0E',
          fontFamily: 'system-ui, sans-serif',
          color: '#F5F4EF',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#60646F', fontSize: '12px', marginBottom: '8px' }}>Błąd aplikacji</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 24px' }}>
            Coś poszło nie tak
          </h1>
          <button
            onClick={reset}
            style={{
              background: '#FF6B1A',
              color: '#0A0B0E',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
