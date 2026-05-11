'use client';

import { useEffect, useState } from 'react';
import { depotApi, type DepotSlot, type UpsertDepotSlotsBody } from '../../api-data-access/depot';

export function useDepotSlots() {
  const [slots, setSlots] = useState<DepotSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    depotApi
      .getSlots()
      .then(setSlots)
      .catch(() => setError('Błąd ładowania mapy składu.'))
      .finally(() => setLoading(false));
  }, []);

  async function bulkCreateSlots(body: UpsertDepotSlotsBody): Promise<void> {
    const updated = await depotApi.bulkCreateSlots(body);
    setSlots(updated);
  }

  async function removeSlot(slotId: string): Promise<void> {
    await depotApi.removeSlot(slotId);
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  }

  const sections = [...new Set(slots.map((s) => s.section))].sort();

  return { slots, sections, loading, error, bulkCreateSlots, removeSlot };
}
