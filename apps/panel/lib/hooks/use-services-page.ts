'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  serviceGroupsApi,
  type ServiceGroupResponse,
  type RimTierResponse,
  type SubServiceResponse,
  type SurchargeResponse,
} from '../../api-data-access/service-groups';
import type {
  ServiceGroupState,
  ServiceVariantState,
  RimTierState,
  SubServiceState,
  SurchargeState,
  ServicesPageState,
} from '../../app/dashboard/services/_types';

// ── API → State ──────────────────────────────────────────────────────────────

function rimTierFromApi(t: RimTierResponse): RimTierState {
  return {
    id: t.id ?? Math.random().toString(36).slice(2),
    rimSizes: t.rimSizes,
    pricePln: String(t.pricePln),
    durationMinutes: String(t.durationMinutes),
    sortOrder: t.sortOrder,
  };
}

function subServiceFromApi(s: SubServiceResponse): SubServiceState {
  return {
    id: (s as { id?: string }).id ?? Math.random().toString(36).slice(2),
    name: s.name,
    included: s.included,
    enabled: s.enabled,
    fromCatalog: s.fromCatalog,
    pricePln: s.pricePln != null ? String(s.pricePln) : null,
    durationMinutes: s.durationMinutes != null ? String(s.durationMinutes) : null,
    sortOrder: s.sortOrder,
  };
}

function variantFromApi(v: ServiceGroupResponse['variants'][number]): ServiceVariantState {
  return {
    id: v.id,
    name: v.name,
    enabled: v.enabled,
    sortOrder: v.sortOrder,
    rimTiers: v.rimTiers.map(rimTierFromApi),
    subServices: v.subServices.map(subServiceFromApi),
  };
}

function groupFromApi(g: ServiceGroupResponse): ServiceGroupState {
  return {
    id: g.id,
    name: g.name,
    pricingMode: g.pricingMode as 'PER_SET' | 'PER_WHEEL',
    sortOrder: g.sortOrder,
    variants: g.variants.map(variantFromApi),
  };
}

function surchargeFromApi(s: SurchargeResponse): SurchargeState {
  return {
    id: s.id,
    name: s.name,
    enabled: s.enabled,
    scope: s.scope as 'PER_WHEEL' | 'PER_SENSOR',
    pricePln: String(s.pricePln),
    sortOrder: s.sortOrder,
  };
}

// ── State → API ──────────────────────────────────────────────────────────────

function rimTierToApi(t: RimTierState) {
  return {
    id: t.id,
    rimSizes: t.rimSizes,
    pricePln: parseFloat(t.pricePln) || 0,
    durationMinutes: parseInt(t.durationMinutes, 10) || 0,
    sortOrder: t.sortOrder,
  };
}

function subServiceToApi(s: SubServiceState) {
  return {
    id: s.id,
    name: s.name,
    included: s.included,
    enabled: s.enabled,
    fromCatalog: s.fromCatalog,
    pricePln: s.pricePln != null ? parseFloat(s.pricePln) || 0 : null,
    durationMinutes: s.durationMinutes != null ? parseInt(s.durationMinutes, 10) || 0 : null,
    sortOrder: s.sortOrder,
  };
}

function variantToApi(v: ServiceVariantState) {
  return {
    id: v.id,
    name: v.name,
    enabled: v.enabled,
    sortOrder: v.sortOrder,
    rimTiers: v.rimTiers.map(rimTierToApi),
    subServices: v.subServices.map(subServiceToApi),
  };
}

function groupToApi(g: ServiceGroupState) {
  return {
    id: g.id,
    name: g.name,
    pricingMode: g.pricingMode,
    sortOrder: g.sortOrder,
    variants: g.variants.map(variantToApi),
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useServicesPage() {
  const [state, setState] = useState<ServicesPageState>({ groups: [], surcharges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([serviceGroupsApi.list(), serviceGroupsApi.surcharges()])
      .then(([groups, surcharges]) => {
        setState({
          groups: groups.map(groupFromApi),
          surcharges: surcharges.map(surchargeFromApi),
        });
      })
      .catch(() => {
        // leave empty state on error — user can still add groups manually
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateState = useCallback((updater: (prev: ServicesPageState) => ServicesPageState) => {
    setState(updater);
    setDirty(true);
    setSaved(false);
    setSaveError(null);
  }, []);

  const revert = useCallback(() => {
    setIsLoading(true);
    setSaveError(null);
    Promise.all([serviceGroupsApi.list(), serviceGroupsApi.surcharges()])
      .then(([groups, surcharges]) => {
        setState({
          groups: groups.map(groupFromApi),
          surcharges: surcharges.map(surchargeFromApi),
        });
        setDirty(false);
        setSaved(false);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const [updatedGroups, updatedSurcharges] = await Promise.all([
        serviceGroupsApi.upsertGroups({ groups: state.groups.map(groupToApi) }),
        serviceGroupsApi.upsertSurcharges({
          surcharges: state.surcharges.map((s) => ({
            id: s.id,
            name: s.name,
            enabled: s.enabled,
            scope: s.scope,
            pricePln: parseFloat(s.pricePln) || 0,
            sortOrder: s.sortOrder,
          })),
        }),
      ]);
      setState({
        groups: updatedGroups.map(groupFromApi),
        surcharges: updatedSurcharges.map(surchargeFromApi),
      });
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Błąd zapisu');
    } finally {
      setIsSaving(false);
    }
  }, [state]);

  return {
    state,
    isLoading,
    isSaving,
    saveError,
    dirty,
    saved,
    updateState,
    revert,
    save,
  };
}
