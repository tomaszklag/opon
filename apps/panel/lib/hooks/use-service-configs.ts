'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getServiceConfigs,
  saveServiceConfigs,
  SERVICE_TYPE_ORDER,
  type ServiceConfigDto,
  type ServiceType,
} from '../../api-data-access/service-configs';

function buildDefaults(): ServiceConfigDto[] {
  const defaults: Record<ServiceType, number> = {
    SEASONAL_SWAP: 45,
    WHEEL_SWAP: 30,
    BALANCING: 20,
    PUNCTURE_REPAIR: 25,
  };
  return SERVICE_TYPE_ORDER.map((serviceType) => ({
    serviceType,
    durationMinutes: defaults[serviceType],
  }));
}

function isEqual(a: ServiceConfigDto[], b: ServiceConfigDto[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    return (
      other !== undefined &&
      item.serviceType === other.serviceType &&
      item.durationMinutes === other.durationMinutes
    );
  });
}

export function useServiceConfigs() {
  const [original, setOriginal] = useState<ServiceConfigDto[]>(buildDefaults());
  const [draft, setDraft] = useState<ServiceConfigDto[]>(buildDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getServiceConfigs()
      .then((serverConfigs) => {
        const mapped = SERVICE_TYPE_ORDER.map((serviceType) => {
          const found = serverConfigs.find((c) => c.serviceType === serviceType);
          if (found) return found;
          const defaults = buildDefaults();
          return (
            defaults.find((d) => d.serviceType === serviceType) ?? {
              serviceType,
              durationMinutes: 30,
            }
          );
        });
        setOriginal(mapped);
        setDraft(mapped);
      })
      .catch(() => {
        setLoadError('Błąd ładowania konfiguracji usług. Odśwież stronę.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setDirty(!isEqual(draft, original));
  }, [draft, original]);

  // Auto-clear saved after 2s
  useEffect(() => {
    if (!saved) return;
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [saved]);

  function updateDuration(serviceType: ServiceType, durationMinutes: number) {
    setDraft((prev) =>
      prev.map((c) => (c.serviceType === serviceType ? { ...c, durationMinutes } : c)),
    );
    setSaveError(null);
  }

  function revert() {
    setDraft(original);
    setSaveError(null);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const updatedConfigs = await saveServiceConfigs(draft);
      const mapped = SERVICE_TYPE_ORDER.map((serviceType) => {
        const found = updatedConfigs.find((c) => c.serviceType === serviceType);
        return (
          found ??
          draft.find((c) => c.serviceType === serviceType) ?? { serviceType, durationMinutes: 30 }
        );
      });
      setOriginal(mapped);
      setDraft(mapped);
      setSaved(true);
    } catch {
      setSaveError('Błąd zapisu konfiguracji usług. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  return {
    configs: draft,
    loading,
    saving,
    saved,
    dirty,
    loadError,
    saveError,
    updateDuration,
    revert,
    save,
  };
}
