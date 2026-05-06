'use client';

import { useState, useRef, useEffect } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import { IconPlus, IconServices, IconCheck, IconXClose } from '../../../../components/icons';
import { ServiceVariantRow } from './ServiceVariantRow';
import { ServiceVariantExpanded } from './ServiceVariantExpanded';
import type { ServiceGroupState, ServiceVariantState, SubServiceState } from '../_types';
import styles from './ServiceGroupCard.module.css';

interface Props {
  group: ServiceGroupState;
  onChange: (updated: ServiceGroupState) => void;
}

export function ServiceGroupCard({ group, onChange }: Props) {
  const [openVariants, setOpenVariants] = useState<Set<string>>(new Set());
  const [addingSubSvc, setAddingSubSvc] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const subInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingSubSvc) subInputRef.current?.focus();
  }, [addingSubSvc]);

  function toggleVariant(variantId: string) {
    setOpenVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.add(variantId);
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
      name: '',
      enabled: true,
      sortOrder: group.variants.length,
      rimTiers: [],
      subServices: [],
    };
    onChange({ ...group, variants: [...group.variants, newVariant] });
  }

  function confirmAddSubSvc() {
    const name = newSubName.trim();
    if (!name) return;
    const newSub: SubServiceState = {
      id: Math.random().toString(36).slice(2),
      name,
      included: false,
      enabled: true,
      fromCatalog: false,
      pricePln: null,
      durationMinutes: null,
      sortOrder:
        Math.max(0, ...group.variants.flatMap((v) => v.subServices.map((s) => s.sortOrder))) + 1,
    };
    onChange({
      ...group,
      variants: group.variants.map((v) => ({
        ...v,
        subServices: [...v.subServices, { ...newSub, id: Math.random().toString(36).slice(2) }],
      })),
    });
    setNewSubName('');
    setAddingSubSvc(false);
  }

  function cancelAddSubSvc() {
    setNewSubName('');
    setAddingSubSvc(false);
  }

  function handleSubKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirmAddSubSvc();
    if (e.key === 'Escape') cancelAddSubSvc();
  }

  const activeCount = group.variants.filter((v) => v.enabled).length;
  const totalCount = group.variants.length;

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
              onNameChange={(name) => updateVariant(variant.id, { ...variant, name })}
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

      {/* Add sub-service — applies to all variants */}
      <div className={styles.addSubSvcBar}>
        {addingSubSvc ? (
          <>
            <input
              ref={subInputRef}
              className={styles.addSubSvcInput}
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={handleSubKeyDown}
              placeholder="Nazwa pod-usługi…"
            />
            <button
              className={styles.addSubSvcConfirm}
              onClick={confirmAddSubSvc}
              disabled={!newSubName.trim()}
              aria-label="Zatwierdź"
            >
              <IconCheck width="10" height="10" />
            </button>
            <button
              className={styles.addSubSvcCancel}
              onClick={cancelAddSubSvc}
              aria-label="Anuluj"
            >
              <IconXClose width="10" height="10" />
            </button>
          </>
        ) : (
          <button className={styles.addSubSvcBtn} onClick={() => setAddingSubSvc(true)}>
            <IconPlus width="9" height="9" />
            <Text variant="nano" as="span">
              Dodaj pod-usługę
            </Text>
          </button>
        )}
      </div>
    </div>
  );
}
