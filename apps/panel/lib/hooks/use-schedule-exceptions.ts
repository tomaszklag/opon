'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  scheduleExceptionsApi,
  type ScheduleException,
} from '../../api-data-access/schedule-exceptions';

export function useScheduleExceptions() {
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    scheduleExceptionsApi
      .list()
      .then(setExceptions)
      .catch(() => setError('Błąd ładowania wyjątków.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addException(
    date: string,
    reason: string,
    customOpenTime?: string,
    customCloseTime?: string,
  ) {
    setSaving(true);
    setError(null);
    try {
      const exc = await scheduleExceptionsApi.create({
        date,
        reason,
        customOpenTime,
        customCloseTime,
      });
      setExceptions((prev) =>
        [...prev.filter((e) => e.date !== date), exc].sort((a, b) => a.date.localeCompare(b.date)),
      );
    } catch {
      setError('Błąd dodawania wyjątku. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  async function removeException(id: string) {
    setSaving(true);
    setError(null);
    try {
      await scheduleExceptionsApi.remove(id);
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError('Błąd usunięcia wyjątku. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  return { exceptions, loading, saving, error, addException, removeException };
}
