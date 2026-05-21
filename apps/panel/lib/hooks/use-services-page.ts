'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  servicesApi,
  type ServiceResponse,
  type AddonResponse,
} from '../../api-data-access/services';
import type {
  ServiceState,
  ServiceVariantState,
  AddonState,
  ServicesPageState,
} from '../../app/dashboard/services/_types';

// ── API → State ──────────────────────────────────────────────────────────────

function variantFromApi(v: ServiceResponse['variants'][number]): ServiceVariantState {
  return {
    id: v.id,
    name: v.name ?? null,
    rimSizes: v.rimSizes,
    pricePln: String(v.pricePln),
    durationMinutes: String(v.durationMinutes),
    pricePerWheelPln: v.pricePerWheelPln != null ? String(v.pricePerWheelPln) : '',
    durationPerWheelMinutes:
      v.durationPerWheelMinutes != null ? String(v.durationPerWheelMinutes) : '',
    sortOrder: v.sortOrder,
  };
}

function serviceFromApi(s: ServiceResponse): ServiceState {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    pricingType: s.pricingType,
    enabled: s.enabled ?? true,
    sortOrder: s.sortOrder,
    variants: s.variants.map(variantFromApi),
    subServiceIds: s.subServiceIds,
    addonIds: s.addonIds,
  };
}

function addonFromApi(a: AddonResponse): AddonState {
  return {
    id: a.id,
    name: a.name,
    pricePln: String(a.pricePln),
    durationMinutes: a.durationMinutes != null ? String(a.durationMinutes) : null,
    enabled: a.enabled ?? true,
    sortOrder: a.sortOrder,
  };
}

// ── State → API ──────────────────────────────────────────────────────────────

function variantToApi(v: ServiceVariantState) {
  return {
    id: v.id,
    name: v.name,
    rimSizes: v.rimSizes,
    pricePln: parseFloat(v.pricePln) || 0,
    durationMinutes: parseInt(v.durationMinutes, 10) || 0,
    pricePerWheelPln: v.pricePerWheelPln !== '' ? parseFloat(v.pricePerWheelPln) || null : null,
    durationPerWheelMinutes:
      v.durationPerWheelMinutes !== '' ? parseInt(v.durationPerWheelMinutes, 10) || null : null,
    sortOrder: v.sortOrder,
  };
}

function serviceToApi(s: ServiceState) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    pricingType: s.pricingType,
    enabled: s.enabled,
    sortOrder: s.sortOrder,
    variants: s.variants.map(variantToApi),
    subServiceIds: s.subServiceIds,
    addonIds: s.addonIds,
  };
}

function addonToApi(a: AddonState) {
  return {
    id: a.id,
    name: a.name,
    pricePln: parseFloat(a.pricePln) || 0,
    durationMinutes: a.durationMinutes != null ? parseInt(a.durationMinutes, 10) || 0 : null,
    enabled: a.enabled,
    sortOrder: a.sortOrder,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useServicesPage() {
  const [state, setState] = useState<ServicesPageState>({ services: [], addons: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([servicesApi.listServices(), servicesApi.listAddons()])
      .then(([services, addons]) => {
        setState({
          services: services.map(serviceFromApi),
          addons: addons.map(addonFromApi),
        });
      })
      .catch(() => {
        // leave empty state on error
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateState = useCallback((updater: (prev: ServicesPageState) => ServicesPageState) => {
    setState(updater);
    setDirty(true);
    setSaved(false);
    setSaveError(null);
  }, []);

  // Remove without marking dirty — item is already deleted from DB
  const removeService = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  }, []);

  const removeAddon = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.id !== id),
    }));
  }, []);

  const revert = useCallback(() => {
    setIsLoading(true);
    setSaveError(null);
    Promise.all([servicesApi.listServices(), servicesApi.listAddons()])
      .then(([services, addons]) => {
        setState({
          services: services.map(serviceFromApi),
          addons: addons.map(addonFromApi),
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
      // Addons first — ServiceAddonLink has onDelete: Cascade on Addon FK.
      // Parallel transactions would cause replaceAllAddons to cascade-delete
      // links that replaceAll just created, leaving services with empty addonIds.
      const updatedAddons = await servicesApi.upsertAddons({
        addons: state.addons.map(addonToApi),
      });
      const updatedServices = await servicesApi.upsertServices({
        services: state.services.map(serviceToApi),
      });
      setState({
        services: updatedServices.map(serviceFromApi),
        addons: updatedAddons.map(addonFromApi),
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
    removeService,
    removeAddon,
    revert,
    save,
  };
}
