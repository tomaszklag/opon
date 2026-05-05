'use client';

import { useState } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import { IconPlus, IconServices } from '../../../../components/icons';
import { ServiceVariantRow } from './ServiceVariantRow';
import { ServiceVariantExpanded } from './ServiceVariantExpanded';
import type { ServiceGroupState, ServiceVariantState } from '../_types';
import styles from './ServiceGroupCard.module.css';

interface Props {
  group: ServiceGroupState;
  onChange: (updated: ServiceGroupState) => void;
}

export function ServiceGroupCard({ group, onChange }: Props) {
  const [openVariants, setOpenVariants] = useState<Set<string>>(new Set());

  function toggleVariant(variantId: string) {
    setOpenVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  }

  function updateVariant(variantId: string, updated: ServiceVariantState) {
    onChange({
      ...group,
      variants: group.variants.map((v) => (v.id === variantId ? updated : v)),
    });
  }

  function addVariant() {
    const newVariant: ServiceVariantState = {
      id: Math.random().toString(36).slice(2),
      name: 'Nowy wariant',
      enabled: true,
      sortOrder: group.variants.length,
      rimTiers: [],
      subServices: [],
    };
    onChange({ ...group, variants: [...group.variants, newVariant] });
  }

  const activeCount = group.variants.filter((v) => v.enabled).length;
  const totalCount = group.variants.length;
  const showPricingMode = group.pricingMode === 'PER_WHEEL' || group.variants.length > 0;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <IconServices width="12" height="12" style={{ color: 'var(--accent)' }} />
        <Heading variant="subsection" as="span">
          {group.name}
        </Heading>
        <span className={styles.countBadge}>
          <Text variant="nano" as="span" mono color="secondary">
            {activeCount}/{totalCount} aktywne
          </Text>
        </span>

        {/* Pricing mode selector — only show for groups that use per-wheel pricing */}
        {group.pricingMode !== 'PER_SET' && (
          <div className={styles.pricingMode}>
            <button
              className={`${styles.pmOpt} ${styles.pmOptActive}`}
              onClick={() => onChange({ ...group, pricingMode: 'PER_WHEEL' })}
            >
              <Text variant="nano" as="span">
                per koło
              </Text>
            </button>
            <button
              className={styles.pmOpt}
              onClick={() => onChange({ ...group, pricingMode: 'PER_SET' })}
            >
              <Text variant="nano" as="span">
                zestaw 4
              </Text>
            </button>
          </div>
        )}

        <span className={styles.spacer} />
        <button className={styles.addVariantBtn} onClick={addVariant}>
          <IconPlus width="9" height="9" />
          <Text variant="nano" as="span">
            Dodaj wariant
          </Text>
        </button>
      </div>

      {/* Variants list */}
      <div className={styles.variants}>
        {group.variants.map((variant) => (
          <div key={variant.id} className={styles.variantBlock}>
            <ServiceVariantRow
              variant={variant}
              isOpen={openVariants.has(variant.id)}
              onToggle={() => toggleVariant(variant.id)}
              onEnabledChange={(enabled) => updateVariant(variant.id, { ...variant, enabled })}
            />
            {openVariants.has(variant.id) && (
              <ServiceVariantExpanded
                variant={variant}
                onChange={(updated) => updateVariant(variant.id, updated)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
