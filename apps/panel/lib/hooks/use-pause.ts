'use client';

import { useEffect, useState } from 'react';
import { getProvider } from '../../api-data-access/providers';
import { setProviderPause } from '../../api-data-access/providers';

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function nextMondayMidnight(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day; // Sun→1, Mon→7, Tue→6 …
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sevenDaysFromNow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function usePause() {
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProvider()
      .then((p) => {
        // pausedUntil may not be in generated types yet — cast through unknown
        const raw = (p as unknown as { pausedUntil?: string | null }).pausedUntil ?? null;
        setPausedUntil(raw);
      })
      .catch(() => {
        // non-critical — ignore silently
      })
      .finally(() => setLoading(false));
  }, []);

  const isPaused = pausedUntil !== null && new Date(pausedUntil) > new Date();

  async function applyPause(until: string | null) {
    setApplying(true);
    setError(null);
    try {
      const res = await setProviderPause(until);
      setPausedUntil(res.pausedUntil);
    } catch {
      setError('Błąd zmiany pauzy. Spróbuj ponownie.');
    } finally {
      setApplying(false);
    }
  }

  function pauseToday() {
    return applyPause(endOfToday());
  }

  function pauseWeekend() {
    return applyPause(nextMondayMidnight());
  }

  function pauseWeek() {
    return applyPause(sevenDaysFromNow());
  }

  function unpause() {
    return applyPause(null);
  }

  return {
    isPaused,
    pausedUntil,
    loading,
    applying,
    error,
    pauseToday,
    pauseWeekend,
    pauseWeek,
    unpause,
  };
}
