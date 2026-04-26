'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePricingTiers } from '../../../lib/hooks/use-pricing-tiers';
import { useAuth } from '../../../lib/auth';
import { IconTrash, IconInfo } from '../../../components/icons';
import styles from './pricing.module.css';

function rimLabel(min: number, max: number): string {
  if (min === max) return `${min} cali`;
  return `${min}–${max} cali`;
}

export default function PricingPage() {
  const router = useRouter();
  const { status } = useAuth();
  const {
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
  } = usePricingTiers();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

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
        <button className={styles.addBtn} onClick={openAddForm} disabled={showAddForm}>
          + Dodaj przedział
        </button>
        <button
          className={styles.saveBtn}
          onClick={save}
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
                  <IconTrash width="13" height="13" />
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

                <button className={styles.cancelBtn} onClick={cancelAddForm}>
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
            <IconInfo width="14" height="14" />
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
