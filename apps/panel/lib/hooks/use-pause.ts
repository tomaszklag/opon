'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getProvider, setProviderPause } from '../../api-data-access/providers';

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function nextMondayMidnight(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
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

const INDEFINITE_UNTIL = '2099-12-31T23:59:59.999Z';

export function isIndefinitePause(until: string | null): boolean {
  if (!until) return false;
  return new Date(until) >= new Date(INDEFINITE_UNTIL);
}

export function usePause() {
  const { data: provider, mutate } = useSWR('/v1/providers/me', getProvider);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pausedUntil = provider?.pausedUntil ?? null;
  const isPaused = pausedUntil !== null && new Date(pausedUntil) > new Date();

  async function applyPause(until: string | null) {
    setApplying(true);
    setError(null);
    try {
      const res = await setProviderPause(until);
      await mutate((prev) => (prev ? { ...prev, pausedUntil: res.pausedUntil ?? null } : prev), {
        revalidate: false,
      });
    } catch {
      setError('Błąd zmiany pauzy. Spróbuj ponownie.');
    } finally {
      setApplying(false);
    }
  }

  return {
    isPaused,
    pausedUntil,
    loading: !provider,
    applying,
    error,
    pauseIndefinitely: () => applyPause(INDEFINITE_UNTIL),
    pauseToday: () => applyPause(endOfToday()),
    pauseWeekend: () => applyPause(nextMondayMidnight()),
    pauseWeek: () => applyPause(sevenDaysFromNow()),
    unpause: () => applyPause(null),
  };
}
