'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationGuard(isDirty: boolean) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const bypassRef = useRef(false);

  // Browser-level: refresh, close tab, direct URL change
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // In-app navigation: Next.js routes via pushState internally
  useEffect(() => {
    if (!isDirty) return;

    const original = window.history.pushState.bind(window.history);

    window.history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
      if (bypassRef.current || !url) {
        original(data, unused, url);
        return;
      }
      pendingUrlRef.current = url.toString();
      setShowModal(true);
    };

    return () => {
      window.history.pushState = original;
    };
  }, [isDirty]);

  const confirm = useCallback(() => {
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    setShowModal(false);
    if (url) {
      bypassRef.current = true;
      router.push(url);
      setTimeout(() => {
        bypassRef.current = false;
      }, 500);
    }
  }, [router]);

  const cancel = useCallback(() => {
    pendingUrlRef.current = null;
    setShowModal(false);
  }, []);

  return { showModal, confirm, cancel };
}
