'use client';

import { useEffect, useRef, useState } from 'react';
import {
  stationsApi,
  type Station,
  type DaySchedule,
  type ServiceType,
} from '../../api-data-access/stations';

function defaultSchedule(): DaySchedule[] {
  return [
    { dayOfWeek: 1, open: true, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 2, open: true, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 3, open: true, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 4, open: true, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 5, open: true, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 6, open: false, startTime: '09:00', endTime: '14:00' },
    { dayOfWeek: 0, open: false, startTime: '09:00', endTime: '14:00' },
  ] as DaySchedule[];
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [savedStations, setSavedStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stationsApi
      .list()
      .then((data) => {
        setStations(data);
        setSavedStations(data);
      })
      .catch(() => {
        setError('Błąd ładowania stanowisk. Odśwież stronę.');
      })
      .finally(() => setLoading(false));
  }, []);

  function markDirty() {
    setDirty(true);
    setSaved(false);
    setError(null);
  }

  function markSaved(updated: Station[]) {
    setStations(updated);
    setSavedStations(updated);
    setDirty(false);
    setSaving(false);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
  }

  async function createStation(name: string) {
    setSaving(true);
    setError(null);
    try {
      const station = await stationsApi.create({
        name,
        services: [],
        schedule: defaultSchedule(),
      });
      const updated = [...stations, station];
      markSaved(updated);
    } catch {
      setError('Błąd tworzenia stanowiska. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  async function updateStation(
    id: string,
    patch: { name?: string; services?: ServiceType[]; schedule?: DaySchedule[] },
  ) {
    setSaving(true);
    setError(null);
    try {
      const station = await stationsApi.update(id, patch);
      const updated = stations.map((s) => (s.id === id ? station : s));
      markSaved(updated);
    } catch {
      setError('Błąd zapisu stanowiska. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  async function deleteStation(id: string) {
    setSaving(true);
    setError(null);
    try {
      await stationsApi.remove(id);
      const updated = stations.filter((s) => s.id !== id);
      markSaved(updated);
    } catch {
      setError('Błąd usunięcia stanowiska. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  async function assignWorker(
    stationId: string,
    workerId: string,
    shiftStart?: string,
    shiftEnd?: string,
  ) {
    setSaving(true);
    setError(null);
    try {
      const station = await stationsApi.assignWorker(stationId, {
        workerId,
        shiftStart,
        shiftEnd,
      });
      const updated = stations.map((s) => (s.id === stationId ? station : s));
      markSaved(updated);
    } catch {
      setError('Błąd przypisania pracownika. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  async function removeWorker(stationId: string, workerId: string) {
    setSaving(true);
    setError(null);
    try {
      const station = await stationsApi.removeWorker(stationId, workerId);
      const updated = stations.map((s) => (s.id === stationId ? station : s));
      markSaved(updated);
    } catch {
      setError('Błąd usunięcia pracownika. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  async function updateShift(
    stationId: string,
    workerId: string,
    shiftStart: string,
    shiftEnd: string,
  ) {
    setSaving(true);
    setError(null);
    try {
      const station = await stationsApi.updateShift(stationId, workerId, { shiftStart, shiftEnd });
      const updated = stations.map((s) => (s.id === stationId ? station : s));
      markSaved(updated);
    } catch {
      setError('Błąd aktualizacji zmiany. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  function revert() {
    setStations(savedStations);
    setDirty(false);
    setSaved(false);
    setError(null);
  }

  // Local optimistic update helper (for UI state before saving)
  function updateStationLocal(id: string, patch: Partial<Station>) {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    markDirty();
  }

  return {
    stations,
    loading,
    saving,
    saved,
    dirty,
    error,
    createStation,
    updateStation,
    deleteStation,
    assignWorker,
    removeWorker,
    updateShift,
    updateStationLocal,
    revert,
  };
}
