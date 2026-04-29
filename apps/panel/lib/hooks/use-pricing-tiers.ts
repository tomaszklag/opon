'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  createPricingTier,
  deletePricingTier,
  getPricingTiers,
  updatePricingTier,
  type PricingTier,
} from '../../api-data-access/pricing-tiers';
import { ApiError } from '../api';
import { newTierSchema, type NewTierValues, type SizeTierValue } from '../schemas/pricing.schema';

export type TierDraft = {
  id?: string;
  sizeTier: SizeTierValue;
  priceSwapPln: number;
  balancingEnabled: boolean;
  priceBalancingPerWheelPln: number;
};

export type TravelFee = { zone1: number; zone2: number };

const NEW_TIER_DEFAULTS: NewTierValues = {
  sizeTier: 'S',
  priceSwapPln: 0,
  balancingEnabled: false,
  priceBalancingPerWheelPln: 20,
};

function tierToDraft(t: PricingTier): TierDraft {
  const balPln = t.priceBalancingPerWheelPln ?? 0;
  return {
    id: t.id,
    sizeTier: t.sizeTier as SizeTierValue,
    priceSwapPln: t.priceSwapPln,
    balancingEnabled: balPln > 0,
    priceBalancingPerWheelPln: balPln > 0 ? balPln : 20,
  };
}

const SIZE_TIER_ORDER: SizeTierValue[] = ['S', 'M', 'L'];

function validateDrafts(drafts: TierDraft[]): string[] {
  const errs: string[] = [];
  for (const d of drafts) {
    if (d.priceSwapPln <= 0) errs.push(`Tier ${d.sizeTier}: cena musi być > 0`);
  }
  return errs;
}

export function usePricingTiers() {
  const [drafts, setDrafts] = useState<TierDraft[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<TierDraft[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [travelFee, setTravelFee] = useState<TravelFee>({ zone1: 0, zone2: 0 });
  const [savedTravelFee, setSavedTravelFee] = useState<TravelFee>({ zone1: 0, zone2: 0 });

  const newTierForm = useForm<NewTierValues>({
    resolver: zodResolver(newTierSchema),
    defaultValues: NEW_TIER_DEFAULTS,
  });

  useEffect(() => {
    getPricingTiers()
      .then((tiers) => {
        const sorted = tiers
          .slice()
          .sort(
            (a, b) =>
              SIZE_TIER_ORDER.indexOf(a.sizeTier as SizeTierValue) -
              SIZE_TIER_ORDER.indexOf(b.sizeTier as SizeTierValue),
          );
        const fetchedDrafts = sorted.map(tierToDraft);
        setDrafts(fetchedDrafts);
        setSavedDrafts(fetchedDrafts);
        const first = sorted[0];
        if (first) {
          const tf: TravelFee = {
            zone1: Number(first.travelFeeFirstKmPln ?? 0),
            zone2: Number(first.travelFeeExtraKmPln ?? 0),
          };
          setTravelFee(tf);
          setSavedTravelFee(tf);
        }
      })
      .catch(() => {
        setErrors(['Błąd ładowania cennika. Odśwież stronę.']);
      })
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
    // Only allow adding a tier for a size not yet present
    const existingSizes = new Set(drafts.map((d) => d.sizeTier));
    const nextAvailable = SIZE_TIER_ORDER.find((s) => !existingSizes.has(s)) ?? 'S';
    setShowAddForm(true);
    newTierForm.reset({ ...NEW_TIER_DEFAULTS, sizeTier: nextAvailable });
    setDirty(true);
  }

  function cancelAddForm() {
    setShowAddForm(false);
    newTierForm.reset(NEW_TIER_DEFAULTS);
  }

  function updateTravelFee(zone1: number, zone2: number) {
    setTravelFee({ zone1, zone2 });
    setDirty(true);
  }

  // Syncs balancing to all tiers — UI shows a single global control
  function updateGlobalBalancing(enabled: boolean, price: number) {
    setDrafts((prev) =>
      prev.map((d) => ({ ...d, balancingEnabled: enabled, priceBalancingPerWheelPln: price })),
    );
    setDirty(true);
  }

  function revert() {
    setDrafts(savedDrafts);
    setTravelFee(savedTravelFee);
    setDeletedIds([]);
    setShowAddForm(false);
    newTierForm.reset(NEW_TIER_DEFAULTS);
    setDirty(false);
    setSaved(false);
    setErrors([]);
  }

  async function save() {
    const draftErrs = validateDrafts(drafts);

    if (showAddForm) {
      const isNewTierValid = await newTierForm.trigger();
      if (!isNewTierValid || draftErrs.length) {
        setErrors(draftErrs);
        return;
      }
    } else if (draftErrs.length) {
      setErrors(draftErrs);
      return;
    }

    setErrors([]);
    setSaving(true);
    try {
      await Promise.all(deletedIds.map((id) => deletePricingTier(id)));
      setDeletedIds([]);

      if (showAddForm) {
        const values = newTierForm.getValues();
        const created = await createPricingTier({
          sizeTier: values.sizeTier,
          priceSwapPln: values.priceSwapPln,
          priceBalancingPerWheelPln: values.balancingEnabled ? values.priceBalancingPerWheelPln : 0,
          travelFeeFirstKmPln: travelFee.zone1,
          travelFeeExtraKmPln: travelFee.zone2,
        });
        setDrafts((prev) =>
          [...prev, tierToDraft(created)].sort(
            (a, b) => SIZE_TIER_ORDER.indexOf(a.sizeTier) - SIZE_TIER_ORDER.indexOf(b.sizeTier),
          ),
        );
        setShowAddForm(false);
        newTierForm.reset(NEW_TIER_DEFAULTS);
      }

      await Promise.all(
        drafts
          .filter((d) => d.id)
          .map((d) =>
            updatePricingTier(d.id!, {
              priceSwapPln: d.priceSwapPln,
              priceBalancingPerWheelPln: d.balancingEnabled ? d.priceBalancingPerWheelPln : 0,
              travelFeeFirstKmPln: travelFee.zone1,
              travelFeeExtraKmPln: travelFee.zone2,
            }),
          ),
      );

      setSavedDrafts(drafts);
      setSavedTravelFee(travelFee);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === 'PRICING_TIER_RANGE_CONFLICT' || err.isConflict)
      ) {
        setErrors(['Tier tego rozmiaru już istnieje. Zmień rozmiar lub usuń istniejący tier.']);
      } else {
        setErrors([
          err instanceof ApiError ? err.message : 'Błąd zapisu cennika. Spróbuj ponownie.',
        ]);
      }
    } finally {
      setSaving(false);
    }
  }

  const globalBalancingEnabled = drafts[0]?.balancingEnabled ?? false;
  const globalBalancingPrice = drafts[0]?.priceBalancingPerWheelPln ?? 20;

  // Whether all 3 tiers are already defined (hide "add" button)
  const allTiersDefined = drafts.length >= 3;

  return {
    drafts,
    newTierForm,
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
    revert,
    travelFee,
    updateTravelFee,
    globalBalancingEnabled,
    globalBalancingPrice,
    updateGlobalBalancing,
    allTiersDefined,
  };
}
