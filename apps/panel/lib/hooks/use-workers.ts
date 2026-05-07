'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  workersApi,
  type Worker,
  type CreateWorkerBody,
  type UpdateWorkerBody,
  type CreateLeaveBody,
  type LeaveType,
} from '../../api-data-access/workers';
import { ApiError } from '../api';

export type { Worker, LeaveType };

function getLeaveConflictMessage(err: unknown): string {
  if (err instanceof ApiError && err.isConflict) {
    return 'Ten pracownik ma już nieobecność w tym terminie';
  }
  if (err instanceof Error) return err.message;
  return 'Nieznany błąd';
}

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    workersApi
      .list()
      .then((data) => {
        setWorkers(data);
      })
      .catch(() => {
        setError('Błąd ładowania pracowników. Odśwież stronę.');
      })
      .finally(() => setLoading(false));
  }, []);

  const createWorker = useCallback(async (name: string, role?: string): Promise<string> => {
    setSaving(true);
    setError(null);
    try {
      const body: CreateWorkerBody = { name };
      if (role?.trim()) body.role = role.trim();
      const created = await workersApi.create(body);
      setWorkers((prev) => [...prev, created]);
      return created.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd dodawania pracownika');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateWorker = useCallback(async (id: string, patch: UpdateWorkerBody) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await workersApi.update(id, patch);
      setWorkers((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zapisu pracownika');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteWorker = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await workersApi.remove(id);
      setWorkers((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd usuwania pracownika');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const addLeave = useCallback(async (workerId: string, leave: CreateLeaveBody) => {
    if (leave.endDate < leave.startDate) {
      throw new Error('Data końca nieobecności musi być po dacie początku');
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await workersApi.addLeave(workerId, leave);
      setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
    } catch (err) {
      const msg = getLeaveConflictMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  const removeLeave = useCallback(async (workerId: string, leaveId: string) => {
    setSaving(true);
    setError(null);
    try {
      await workersApi.removeLeave(workerId, leaveId);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId ? { ...w, leaves: w.leaves.filter((l) => l.id !== leaveId) } : w,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd usuwania nieobecności');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    workers,
    loading,
    saving,
    error,
    createWorker,
    updateWorker,
    deleteWorker,
    addLeave,
    removeLeave,
  };
}
