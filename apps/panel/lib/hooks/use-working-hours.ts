'use client';

import { useEffect, useRef, useState } from 'react';
import { getWorkingHours, saveWorkingHours } from '../../api-data-access/working-hours';

export type CapacityBlock = {
  from: string;
  to: string;
  workstations: number;
};

export type DayEntry = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  workstations: number;
  blocks: CapacityBlock[] | null;
};

export const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function defaultDay(dayOfWeek: number): DayEntry {
  return {
    dayOfWeek,
    isClosed: dayOfWeek === 0,
    openTime: dayOfWeek === 6 ? '09:00' : '08:00',
    closeTime: dayOfWeek === 6 ? '14:00' : '18:00',
    slotMinutes: 45,
    workstations: 1,
    blocks: null,
  };
}

function parseTime(time: string): [number, number] {
  const parts = time.split(':');
  return [parseInt(parts[0] ?? '0', 10), parseInt(parts[1] ?? '0', 10)];
}

function toMins(hhmm: string): number {
  const [h, m] = parseTime(hhmm);
  return h * 60 + m;
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
      continue;
    }
    if (day.blocks && day.blocks.length > 0) {
      const openMins = oh * 60 + om;
      const closeMins = ch * 60 + cm;
      const sorted = [...day.blocks].sort((a, b) => toMins(a.from) - toMins(b.from));
      let prevEnd = openMins;
      for (const block of sorted) {
        const from = toMins(block.from);
        const to = toMins(block.to);
        if (from >= to) {
          errs[day.dayOfWeek] = 'Błędny przedział bloku';
          break;
        }
        if (from < openMins || to > closeMins) {
          errs[day.dayOfWeek] = 'Blok wychodzi poza godziny dnia';
          break;
        }
        if (from < prevEnd) {
          errs[day.dayOfWeek] = 'Bloki obsady nakładają się';
          break;
        }
        prevEnd = to;
      }
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
            workstations: found.workstations ?? 1,
            blocks: (found.blocks as CapacityBlock[] | null | undefined) ?? null,
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

  function toggleBlocks(dayOfWeek: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        if (d.blocks !== null) return { ...d, blocks: null };
        return {
          ...d,
          blocks: [{ from: d.openTime, to: d.closeTime, workstations: d.workstations }],
        };
      }),
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[dayOfWeek];
      return next;
    });
    setSaveError(null);
    setDirty(true);
  }

  function updateBlock(dayOfWeek: number, index: number, patch: Partial<CapacityBlock>) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek || !d.blocks) return d;
        const blocks = d.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
        return { ...d, blocks };
      }),
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[dayOfWeek];
      return next;
    });
    setSaveError(null);
    setDirty(true);
  }

  function addBlock(dayOfWeek: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek || !d.blocks || d.blocks.length >= 3) return d;
        const lastBlock = d.blocks[d.blocks.length - 1];
        const from = lastBlock?.to ?? d.openTime;
        const newBlock: CapacityBlock = { from, to: d.closeTime, workstations: 1 };
        return { ...d, blocks: [...d.blocks, newBlock] };
      }),
    );
    setSaveError(null);
    setDirty(true);
  }

  function removeBlock(dayOfWeek: number, index: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek || !d.blocks) return d;
        const blocks = d.blocks.filter((_, i) => i !== index);
        return { ...d, blocks: blocks.length > 0 ? blocks : null };
      }),
    );
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
              workstations: from.workstations,
              blocks: from.blocks,
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
    toggleBlocks,
    updateBlock,
    addBlock,
    removeBlock,
    revert,
    save,
  };
}
