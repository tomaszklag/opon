'use client';

import { useEffect, useRef, useState } from 'react';
import { getWorkingHours, saveWorkingHours } from '../../api-data-access/working-hours';

export type DayEntry = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
};

export const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function defaultDay(dayOfWeek: number): DayEntry {
  return {
    dayOfWeek,
    isClosed: dayOfWeek === 0,
    openTime: dayOfWeek === 6 ? '09:00' : '08:00',
    closeTime: dayOfWeek === 6 ? '14:00' : '18:00',
    slotMinutes: 45,
  };
}

function parseTime(time: string): [number, number] {
  const parts = time.split(':');
  return [parseInt(parts[0] ?? '0', 10), parseInt(parts[1] ?? '0', 10)];
}

function validate(days: DayEntry[]): Record<number, string> {
  const errs: Record<number, string> = {};
  for (const day of days) {
    if (day.isClosed) continue;
    if (!day.openTime) {
      errs[day.dayOfWeek] = 'Podaj godzinę otwarcia';
      continue;
    }
    if (!day.closeTime) {
      errs[day.dayOfWeek] = 'Podaj godzinę zamknięcia';
      continue;
    }
    const [oh, om] = parseTime(day.openTime);
    const [ch, cm] = parseTime(day.closeTime);
    if (oh * 60 + om >= ch * 60 + cm) {
      errs[day.dayOfWeek] = 'Godzina otwarcia musi być przed godziną zamknięcia';
    }
  }
  return errs;
}

function inferDefaultSlot(days: DayEntry[]): number {
  const counts: Record<number, number> = {};
  for (const d of days) {
    if (!d.isClosed) counts[d.slotMinutes] = (counts[d.slotMinutes] ?? 0) + 1;
  }
  let best = 45;
  let bestCount = 0;
  for (const [mins, cnt] of Object.entries(counts)) {
    if (cnt > bestCount) {
      best = Number(mins);
      bestCount = cnt;
    }
  }
  return best;
}

const INITIAL_DAYS = DISPLAY_ORDER.map(defaultDay);

export function useWorkingHours() {
  const [days, setDays] = useState<DayEntry[]>(INITIAL_DAYS);
  const [savedDays, setSavedDays] = useState<DayEntry[]>(INITIAL_DAYS);
  const [defaultSlotMinutes, setDefaultSlotMinutes] = useState(45);
  const [savedDefaultSlot, setSavedDefaultSlot] = useState(45);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getWorkingHours()
      .then((serverDays) => {
        const mapped = DISPLAY_ORDER.map((dow) => {
          const found = serverDays.find((d) => d.dayOfWeek === dow);
          if (!found) return defaultDay(dow);
          return {
            dayOfWeek: found.dayOfWeek,
            isClosed: found.isClosed,
            openTime: found.openTime ?? (dow === 6 ? '09:00' : '08:00'),
            closeTime: found.closeTime ?? (dow === 6 ? '14:00' : '18:00'),
            slotMinutes: found.slotMinutes,
          };
        });
        const inferredSlot = inferDefaultSlot(mapped);
        setDays(mapped);
        setSavedDays(mapped);
        setDefaultSlotMinutes(inferredSlot);
        setSavedDefaultSlot(inferredSlot);
      })
      .catch(() => {
        setLoadError('Błąd ładowania godzin pracy. Odśwież stronę.');
      })
      .finally(() => setLoading(false));
  }, []);

  function updateDay(dayOfWeek: number, patch: Partial<DayEntry>) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[dayOfWeek];
      return next;
    });
    setSaveError(null);
    setDirty(true);
  }

  function updateDefaultSlot(minutes: number) {
    setDefaultSlotMinutes(minutes);
    setSaveError(null);
    setDirty(true);
  }

  function applyDefaultSlotToAll() {
    setDays((prev) => prev.map((d) => ({ ...d, slotMinutes: defaultSlotMinutes })));
    setSaveError(null);
    setDirty(true);
  }

  function copyDayToAll(fromDow: number) {
    const from = days.find((d) => d.dayOfWeek === fromDow);
    if (!from) return;
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek !== fromDow
          ? {
              ...d,
              openTime: from.openTime,
              closeTime: from.closeTime,
              slotMinutes: from.slotMinutes,
            }
          : d,
      ),
    );
    setSaveError(null);
    setDirty(true);
  }

  function revert() {
    setDays(savedDays);
    setDefaultSlotMinutes(savedDefaultSlot);
    setErrors({});
    setSaveError(null);
    setDirty(false);
    setSaved(false);
  }

  async function save() {
    const errs = validate(days);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await saveWorkingHours({ days });
      setSavedDays(days);
      setSavedDefaultSlot(defaultSlotMinutes);
      setDirty(false);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Błąd zapisu godzin pracy. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  return {
    days,
    defaultSlotMinutes,
    loading,
    saving,
    saved,
    dirty,
    errors,
    loadError,
    saveError,
    updateDay,
    updateDefaultSlot,
    applyDefaultSlotToAll,
    copyDayToAll,
    revert,
    save,
  };
}
