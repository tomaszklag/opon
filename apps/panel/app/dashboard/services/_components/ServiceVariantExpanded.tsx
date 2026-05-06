'use client';

import { Text } from '@opony/design-system-web';
import { IconPlus } from '../../../../components/icons';
import { RimTierRow } from './RimTierRow';
import { SubServiceRow } from './SubServiceRow';
import type { RimTierState, ServiceVariantState, SubServiceState } from '../_types';
import styles from './ServiceVariantExpanded.module.css';

interface Props {
  variant: ServiceVariantState;
  onChange: (updated: ServiceVariantState) => void;
}

export function ServiceVariantExpanded({ variant, onChange }: Props) {
  function updateTier(tierId: string, updated: RimTierState) {
    onChange({
      ...variant,
      rimTiers: variant.rimTiers.map((t) => (t.id === tierId ? updated : t)),
    });
  }

  function deleteTier(tierId: string) {
    onChange({
      ...variant,
      rimTiers: variant.rimTiers.filter((t) => t.id !== tierId),
    });
  }

  function addTier() {
    const newTier: RimTierState = {
      id: Math.random().toString(36).slice(2),
      rimSizes: [],
      pricePln: '',
      durationMinutes: '',
      sortOrder: variant.rimTiers.length,
    };
    onChange({ ...variant, rimTiers: [...variant.rimTiers, newTier] });
  }

  function updateSubService(subId: string, updated: SubServiceState) {
    onChange({
      ...variant,
      subServices: variant.subServices.map((s) => (s.id === subId ? updated : s)),
    });
  }

  function deleteSubService(subId: string) {
    onChange({
      ...variant,
      subServices: variant.subServices.filter((s) => s.id !== subId),
    });
  }

  return (
    <div className={styles.expanded}>
      {/* Rim Tiers Section */}
      <div className={styles.expLabel}>
        <RimCircleIcon />
        <Text variant="kicker-sm" as="span">
          Zakresy rozmiarów
        </Text>
        <span className={styles.line} />
      </div>

      <div className={styles.rimTiers}>
        {variant.rimTiers.map((tier) => (
          <RimTierRow
            key={tier.id}
            tier={tier}
            onChange={(updated) => updateTier(tier.id, updated)}
            onDelete={() => deleteTier(tier.id)}
          />
        ))}
      </div>

      <button className={styles.addTierBtn} onClick={addTier}>
        <IconPlus width="9" height="9" />
        <Text variant="nano" as="span">
          Dodaj zakres
        </Text>
      </button>

      {/* Sub-services Section */}
      <div className={styles.expLabel}>
        <CheckboxIcon />
        <Text variant="kicker-sm" as="span">
          Pod-usługi
        </Text>
        <span className={styles.line} />
        <span className={styles.legend}>
          <span className={styles.legendItem}>
            <InheritLegendIcon />
            <Text variant="nano" as="span" color="secondary">
              jak usł. = dziedziczy
            </Text>
          </span>
          <span className={styles.legendDot} />
          <span className={styles.legendItemAccent}>
            <OverrideLegendIcon />
            <Text variant="nano" as="span" color="accent">
              otwarta = własna cena/czas
            </Text>
          </span>
        </span>
      </div>

      <div className={styles.subSvcList}>
        {variant.subServices.map((sub) => (
          <SubServiceRow
            key={sub.id}
            sub={sub}
            onChange={(updated) => updateSubService(sub.id, updated)}
            onDelete={() => deleteSubService(sub.id)}
          />
        ))}
      </div>
    </div>
  );
}

function RimCircleIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckboxIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function InheritLegendIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function OverrideLegendIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
