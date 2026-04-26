'use client';

import { useEffect, useState } from 'react';
import {
  createPricingTier,
  deletePricingTier,
  getPricingTiers,
  updatePricingTier,
  type PricingTier,
} from '../../api-data-access/pricing-tiers';
import { ApiError } from '../api';

export type TierDraft = {
  id?: string;
  rimSizeMin: number;
  rimSizeMax: number;
  priceSwapPln: number;
  balancingEnabled: boolean;
  priceBalancingPerWheelPln: number;
};

export const DEFAULT_NEW_TIER: TierDraft = {
  rimSizeMin: 13,
  rimSizeMax: 15,
  priceSwapPln: 0,
  balancingEnabled: false,
  priceBalancingPerWheelPln: 20,
};

function tierToDraft(t: PricingTier): TierDraft {
  const balPln = t.priceBalancingPerWheelPln ?? 0;
  return {
    id: t.id,
    rimSizeMin: t.rimSizeMin,
    rimSizeMax: t.rimSizeMax,
    priceSwapPln: t.priceSwapPln,
    balancingEnabled: balPln > 0,
    priceBalancingPerWheelPln: balPln > 0 ? balPln : 20,
  };
}

export function usePricingTiers() {
  const [drafts, setDrafts] = useState<TierDraft[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTier, setNewTier] = useState<TierDraft>({ ...DEFAULT_NEW_TIER });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    getPricingTiers()
      .then((tiers) =>
        setDrafts(tiers.sort((a, b) => a.rimSizeMin - b.rimSizeMin).map(tierToDraft)),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateDraft(idx: number, patch: Partial<TierDraft>) {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
    setDirty(true);
  }

  function deleteDraft(idx: number) {
    const draft = drafts[idx];
    if (draft?.id) setDeletedIds((prev) => [...prev, draft.id!]);
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function openAddForm() {
    setShowAddForm(true);
    setNewTier({ ...DEFAULT_NEW_TIER });
    setDirty(true);
  }

  function cancelAddForm() {
    setShowAddForm(false);
    setNewTier({ ...DEFAULT_NEW_TIER });
  }

  function validate(): string[] {
    const errs: string[] = [];
    for (const d of drafts) {
      if (d.rimSizeMin > d.rimSizeMax) errs.push(`Tier ${d.rimSizeMin}–${d.rimSizeMax}: min > max`);
      if (d.priceSwapPln <= 0)
        errs.push(`Tier ${d.rimSizeMin}–${d.rimSizeMax} cali: cena musi być > 0`);
    }
    if (showAddForm) {
      if (newTier.rimSizeMin > newTier.rimSizeMax)
        errs.push('Nowy tier: rozmiar min nie może być większy niż max');
      if (newTier.priceSwapPln <= 0) errs.push('Nowy tier: cena wymiany musi być > 0');
    }
    return errs;
  }

  async function save() {
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSaving(true);
    try {
      await Promise.all(deletedIds.map((id) => deletePricingTier(id)));
      setDeletedIds([]);

      if (showAddForm) {
        const created = await createPricingTier({
          rimSizeMin: newTier.rimSizeMin,
          rimSizeMax: newTier.rimSizeMax,
          priceSwapPln: newTier.priceSwapPln,
          priceBalancingPerWheelPln: newTier.balancingEnabled
            ? newTier.priceBalancingPerWheelPln
            : 0,
        });
        setDrafts((prev) =>
          [...prev, tierToDraft(created)].sort((a, b) => a.rimSizeMin - b.rimSizeMin),
        );
        setShowAddForm(false);
        setNewTier({ ...DEFAULT_NEW_TIER });
      }

      await Promise.all(
        drafts
          .filter((d) => d.id)
          .map((d) =>
            updatePricingTier(d.id!, {
              priceSwapPln: d.priceSwapPln,
              priceBalancingPerWheelPln: d.balancingEnabled ? d.priceBalancingPerWheelPln : 0,
            }),
          ),
      );

      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors(['Przedział felg już istnieje. Zmień zakres lub usuń istniejący tier.']);
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    drafts,
    newTier,
    setNewTier,
    loading,
    saving,
    saved,
    dirty,
    showAddForm,
    errors,
    updateDraft,
    deleteDraft,
    openAddForm,
    cancelAddForm,
    save,
  };
}
