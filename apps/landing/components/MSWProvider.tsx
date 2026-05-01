'use client';
import { useEffect } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCK === 'true' && typeof window !== 'undefined') {
      import('../mocks/browser').then(({ worker }) => {
        worker.start({ onUnhandledRequest: 'bypass' });
      });
    }
  }, []);
  return <>{children}</>;
}
