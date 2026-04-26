'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getPricingTiers,
  createPricingTier,
  updatePricingTier,
  deletePricingTier,
  type PricingTier,
} from '../../../api-data-access/pricing-tiers';
import { ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './pricing.module.css';

type TierDraft = {
  id?: string;
  rimSizeMin: number;
  rimSizeMax: number;
  priceSwapPln: number;
  balancingEnabled: boolean;
  priceBalancingPerWheelPln: number;
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

function rimLabel(min: number, max: number): string {
  if (min === max) return `${min} cali`;
  return `${min}–${max} cali`;
}

const DEFAULT_NEW: TierDraft = {
  rimSizeMin: 13,
  rimSizeMax: 15,
  priceSwapPln: 0,
  balancingEnabled: false,
  priceBalancingPerWheelPln: 20,
};

export default function PricingPage() {
  const router = useRouter();
  const { status } = useAuth();

  const [drafts, setDrafts] = useState<TierDraft[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTier, setNewTier] = useState<TierDraft>({ ...DEFAULT_NEW });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    getPricingTiers()
      .then((tiers) =>
        setDrafts(tiers.sort((a, b) => a.rimSizeMin - b.rimSizeMin).map(tierToDraft)),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

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

  function validate(): string[] {
    const errs: string[] = [];
    for (const d of drafts) {
      if (d.rimSizeMin > d.rimSizeMax) errs.push(`Tier ${d.rimSizeMin}–${d.rimSizeMax}: min > max`);
      if (d.priceSwapPln <= 0)
        errs.push(`Tier ${rimLabel(d.rimSizeMin, d.rimSizeMax)}: cena musi być > 0`);
    }
    if (showAddForm) {
      if (newTier.rimSizeMin > newTier.rimSizeMax)
        errs.push('Nowy tier: rozmiar min nie może być większy niż max');
      if (newTier.priceSwapPln <= 0) errs.push('Nowy tier: cena wymiany musi być > 0');
    }
    return errs;
  }

  async function handleSave() {
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
        setNewTier({ ...DEFAULT_NEW });
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

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const hasBalancing = drafts.some((d) => d.balancingEnabled);
  const firstBalancing = drafts.find((d) => d.balancingEnabled);

  return (
    <div className={styles.page}>
      <div className={styles.actionBar}>
        {dirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
        {saved && <span className={styles.savedChip}>Zapisano</span>}
        <button
          className={styles.addBtn}
          onClick={() => {
            setShowAddForm(true);
            setDirty(true);
          }}
          disabled={showAddForm}
        >
          + Dodaj przedział
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || (!dirty && !showAddForm)}
        >
          {saving ? 'Zapisywanie…' : 'Zapisz cennik'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>Cennik</h1>
            <p className={styles.pageSub}>
              Widoczny publicznie — klient widzi te ceny przy wyszukiwaniu warsztatu.
            </p>
          </header>

          <section className={styles.secCard}>
            <div className={styles.secHead}>
              <h2 className={styles.secTitle}>Wymiana 4 opon</h2>
              <span className={styles.secSub}>Cena za komplet · PLN</span>
            </div>

            {drafts.length === 0 && !showAddForm && (
              <p className={styles.emptyState}>
                Brak zdefiniowanych przedziałów. Kliknij &bdquo;Dodaj przedział&rdquo; aby
                rozpocząć.
              </p>
            )}

            {drafts.map((d, idx) => (
              <div key={d.id ?? `draft-${idx}`} className={styles.tierRow}>
                <div className={styles.tierInfo}>
                  <span className={styles.tierName}>{rimLabel(d.rimSizeMin, d.rimSizeMax)}</span>
                </div>

                <label className={styles.priceInput}>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={d.priceSwapPln}
                    onChange={(e) => updateDraft(idx, { priceSwapPln: Number(e.target.value) })}
                    aria-label={`Cena wymiany ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
                  />
                  <span className={styles.priceUnit}>zł</span>
                </label>

                <div className={styles.balancingWrap}>
                  <button
                    className={[
                      styles.toggleSmall,
                      d.balancingEnabled ? styles.toggleSmallOn : '',
                    ].join(' ')}
                    role="switch"
                    aria-checked={d.balancingEnabled}
                    aria-label="Wyważanie"
                    onClick={() => updateDraft(idx, { balancingEnabled: !d.balancingEnabled })}
                  />
                  <span className={styles.balancingLabel}>Wyważanie</span>
                  {d.balancingEnabled && (
                    <label className={[styles.priceInput, styles.priceInputSm].join(' ')}>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={d.priceBalancingPerWheelPln}
                        onChange={(e) =>
                          updateDraft(idx, { priceBalancingPerWheelPln: Number(e.target.value) })
                        }
                        aria-label="Cena wyważania"
                      />
                      <span className={styles.priceUnit}>zł/koło</span>
                    </label>
                  )}
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteDraft(idx)}
                  aria-label={`Usuń tier ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            ))}

            {showAddForm && (
              <div className={[styles.tierRow, styles.tierRowNew].join(' ')}>
                <div className={styles.rimRangeInputs}>
                  <span className={styles.rimLabel}>Felga</span>
                  <input
                    className={styles.rimInput}
                    type="number"
                    min={10}
                    max={24}
                    value={newTier.rimSizeMin}
                    onChange={(e) =>
                      setNewTier((p) => ({ ...p, rimSizeMin: Number(e.target.value) }))
                    }
                    aria-label="Rozmiar felgi od"
                  />
                  <span className={styles.rimSep}>–</span>
                  <input
                    className={styles.rimInput}
                    type="number"
                    min={10}
                    max={24}
                    value={newTier.rimSizeMax}
                    onChange={(e) =>
                      setNewTier((p) => ({ ...p, rimSizeMax: Number(e.target.value) }))
                    }
                    aria-label="Rozmiar felgi do"
                  />
                  <span className={styles.rimUnit}>cali</span>
                </div>

                <label className={styles.priceInput}>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={newTier.priceSwapPln || ''}
                    placeholder="0"
                    onChange={(e) =>
                      setNewTier((p) => ({ ...p, priceSwapPln: Number(e.target.value) }))
                    }
                    aria-label="Cena wymiany"
                  />
                  <span className={styles.priceUnit}>zł</span>
                </label>

                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTier({ ...DEFAULT_NEW });
                  }}
                >
                  Anuluj
                </button>
              </div>
            )}
          </section>

          {errors.length > 0 && (
            <ul className={styles.errorList}>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}

          <div className={styles.infoNote}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
            <p>
              <strong>Zmiana cen wpływa tylko na nowe rezerwacje.</strong> Istniejące rezerwacje
              zachowują ceny sprzed zmiany. W okresie pilotażowym platforma nie pobiera prowizji.
            </p>
          </div>
        </div>

        <aside className={styles.previewCol}>
          <div className={styles.previewPanel}>
            <div className={styles.previewHead}>
              <span className={styles.previewTitle}>Podgląd dla klienta</span>
              <span className={styles.previewLiveBadge}>
                <span className={styles.previewLiveDot} />
                Live
              </span>
            </div>

            {drafts.length === 0 ? (
              <p className={styles.previewEmpty}>Brak tierów — dodaj pierwszy przedział</p>
            ) : (
              <div className={styles.previewTable}>
                {drafts.map((d, idx) => (
                  <div key={d.id ?? idx} className={styles.previewTierRow}>
                    <span className={styles.previewTierName}>
                      {rimLabel(d.rimSizeMin, d.rimSizeMax)}
                    </span>
                    <span className={styles.previewTierPrice}>{d.priceSwapPln} zł</span>
                  </div>
                ))}
              </div>
            )}

            {hasBalancing && firstBalancing && (
              <div className={styles.previewExtras}>
                <span>Wyważanie</span>
                <span className={styles.previewExtrasVal}>
                  +{firstBalancing.priceBalancingPerWheelPln} zł/koło
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
