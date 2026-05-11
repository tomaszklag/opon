'use client';

import { useEffect, useState } from 'react';
import {
  depotApi,
  type TireSet,
  type TireSetDetail,
  type TireSetPage,
  type DepotStats,
  type CreateTireSetBody,
  type UpdateTireSetBody,
  type DepotListParams,
} from '../../api-data-access/depot';

export function useDepot(params?: DepotListParams) {
  const [page, setPage] = useState<TireSetPage | null>(null);
  const [stats, setStats] = useState<DepotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    setLoading(true);
    Promise.all([depotApi.list(params), depotApi.getStats()])
      .then(([p, s]) => {
        setPage(p);
        setStats(s);
      })
      .catch(() => setError('Błąd ładowania składu. Odśwież stronę.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  async function createTireSet(body: CreateTireSetBody): Promise<TireSetDetail> {
    const ts = await depotApi.create(body);
    const [p, s] = await Promise.all([depotApi.list(params), depotApi.getStats()]);
    setPage(p);
    setStats(s);
    return ts;
  }

  async function updateTireSet(id: string, body: UpdateTireSetBody): Promise<TireSetDetail> {
    const ts = await depotApi.update(id, body);
    const p = await depotApi.list(params);
    setPage(p);
    return ts;
  }

  async function pickupTireSet(id: string): Promise<TireSetDetail> {
    const ts = await depotApi.pickup(id);
    const [p, s] = await Promise.all([depotApi.list(params), depotApi.getStats()]);
    setPage(p);
    setStats(s);
    return ts;
  }

  async function storeTireSet(
    id: string,
    data: { storedAt?: string; releaseDue?: string; pricePln?: number; notes?: string },
  ): Promise<TireSetDetail> {
    const ts = await depotApi.store(id, data);
    const [p, s] = await Promise.all([depotApi.list(params), depotApi.getStats()]);
    setPage(p);
    setStats(s);
    return ts;
  }

  async function removeTireSet(id: string): Promise<void> {
    await depotApi.remove(id);
    const [p, s] = await Promise.all([depotApi.list(params), depotApi.getStats()]);
    setPage(p);
    setStats(s);
  }

  return {
    items: page?.items ?? [],
    total: page?.total ?? 0,
    stats,
    loading,
    error,
    createTireSet,
    updateTireSet,
    pickupTireSet,
    storeTireSet,
    removeTireSet,
  };
}

export function useDepotDetail(id: string | null) {
  const [detail, setDetail] = useState<TireSetDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    setLoading(true);
    depotApi
      .get(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { detail, loading, setDetail };
}
