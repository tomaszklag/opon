'use client';

import { useEffect, useRef, useState } from 'react';
import {
  stationsApi,
  type Station,
  type DaySchedule,
  type WorkerAssignment,
} from '../../api-data-access/stations';

const TEMP_PREFIX = '__new__';

function isNew(id: string) {
  return id.startsWith(TEMP_PREFIX);
}

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
      .catch(() => setError('Błąd ładowania stanowisk. Odśwież stronę.'))
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

  function createStation(name: string) {
    const tempId = `${TEMP_PREFIX}${Date.now()}`;
    const station: Station = {
      id: tempId,
      providerId: '',
      name,
      serviceIds: [],
      schedule: defaultSchedule(),
      workers: [],
      createdAt: new Date().toISOString(),
    };
    setStations((prev) => [...prev, station]);
    markDirty();
  }

  function deleteStation(id: string) {
    setStations((prev) => prev.filter((s) => s.id !== id));
    markDirty();
  }

  function assignWorkerLocal(
    stationId: string,
    workerId: string,
    workerName: string,
    workerRole: string | null,
  ) {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== stationId) return s;
        if (s.workers.some((w) => w.workerId === workerId)) return s;
        const newWorker: WorkerAssignment = {
          workerId,
          workerName,
          workerRole,
          shiftStart: null,
          shiftEnd: null,
        };
        return { ...s, workers: [...s.workers, newWorker] };
      }),
    );
    markDirty();
  }

  function removeWorkerLocal(stationId: string, workerId: string) {
    setStations((prev) =>
      prev.map((s) =>
        s.id === stationId
          ? { ...s, workers: s.workers.filter((w) => w.workerId !== workerId) }
          : s,
      ),
    );
    markDirty();
  }

  function updateStationLocal(id: string, patch: Partial<Station>) {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    markDirty();
  }

  function revert() {
    setStations(savedStations);
    setDirty(false);
    setSaved(false);
    setError(null);
  }

  async function saveAll(current: Station[]) {
    setSaving(true);
    setError(null);
    try {
      // Map temp IDs → real IDs after creation
      const result: Station[] = [];

      // Delete stations removed from the list (only real stations that existed in DB)
      for (const original of savedStations) {
        if (!current.find((s) => s.id === original.id)) {
          await stationsApi.remove(original.id);
        }
      }

      for (const station of current) {
        if (isNew(station.id)) {
          // Create new station
          const created = await stationsApi.create({
            name: station.name,
            serviceIds: station.serviceIds,
            schedule: station.schedule,
          });
          // Assign any workers added before save
          for (const w of station.workers) {
            await stationsApi.assignWorker(created.id, { workerId: w.workerId });
          }
          result.push(created);
        } else {
          // Update existing station if changed
          const original = savedStations.find((s) => s.id === station.id);
          if (original) {
            if (
              station.name !== original.name ||
              JSON.stringify(station.serviceIds) !== JSON.stringify(original.serviceIds) ||
              JSON.stringify(station.schedule) !== JSON.stringify(original.schedule)
            ) {
              await stationsApi.update(station.id, {
                name: station.name,
                serviceIds: station.serviceIds,
                schedule: station.schedule,
              });
            }

            // Sync workers
            const originalIds = new Set(original.workers.map((w) => w.workerId));
            const currentIds = new Set(station.workers.map((w) => w.workerId));
            for (const w of station.workers) {
              if (!originalIds.has(w.workerId)) {
                await stationsApi.assignWorker(station.id, { workerId: w.workerId });
              }
            }
            for (const w of original.workers) {
              if (!currentIds.has(w.workerId)) {
                await stationsApi.removeWorker(station.id, w.workerId);
              }
            }
          }
          result.push(station);
        }
      }

      markSaved(result);
    } catch {
      setError('Błąd zapisu zmian. Spróbuj ponownie.');
      setSaving(false);
    }
  }

  return {
    stations,
    loading,
    saving,
    saved,
    dirty,
    error,
    createStation,
    deleteStation,
    assignWorkerLocal,
    removeWorkerLocal,
    updateStationLocal,
    saveAll,
    revert,
  };
}
