'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
// global-error renders outside RootLayout — we must import DS tokens manually
import '@opony/design-system-web/global.css';
import styles from './global-error.module.css';

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
      <body className={styles.body}>
        <div className={styles.wrap}>
          <p className={styles.label}>Błąd aplikacji</p>
          <h1 className={styles.title}>Coś poszło nie tak</h1>
          <button onClick={reset} className={styles.btn}>
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
