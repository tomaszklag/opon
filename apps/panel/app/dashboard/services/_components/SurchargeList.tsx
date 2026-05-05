'use client';

import { useState } from 'react';
import { Heading, Text } from '@opony/design-system-web';
import { IconBolt, IconPlus } from '../../../../components/icons';
import { SurchargeRow } from './SurchargeRow';
import type { SurchargeState } from '../_types';
import styles from './SurchargeList.module.css';

interface Props {
  surcharges: SurchargeState[];
  onChange: (updated: SurchargeState[]) => void;
}

export function SurchargeList({ surcharges, onChange }: Props) {
  const [newSurcharge, setNewSurcharge] = useState<SurchargeState | null>(null);

  function handleAdd() {
    setNewSurcharge({
      id: Math.random().toString(36).slice(2),
      name: '',
      enabled: true,
      scope: 'PER_WHEEL',
      pricePln: '',
      sortOrder: surcharges.length,
    });
  }

  function handleConfirmNew() {
    if (newSurcharge && newSurcharge.name.trim()) {
      onChange([...surcharges, { ...newSurcharge, name: newSurcharge.name.trim() }]);
    }
    setNewSurcharge(null);
  }

  function handleCancelNew() {
    setNewSurcharge(null);
  }

  function updateSurcharge(id: string, updated: SurchargeState) {
    onChange(surcharges.map((s) => (s.id === id ? updated : s)));
  }

  function deleteSurcharge(id: string) {
    onChange(surcharges.filter((s) => s.id !== id));
  }

  return (
    <div className={styles.card}>
      {/* Purple top border glow */}
      <div className={styles.topGlow} aria-hidden="true" />

      {/* Header */}
      <div className={styles.header}>
        <IconBolt width="11" height="11" style={{ color: 'var(--purple)', flexShrink: 0 }} />
        <div>
          <span className={styles.titleWrap}>
            <Heading variant="subsection" as="span">
              Dopłaty do usług
            </Heading>
          </span>
          <Text variant="nano" as="div" color="secondary">
            cecha pojazdu → doliczana automatycznie przy rezerwacji
          </Text>
        </div>
        <span className={styles.spacer} />
        <button className={styles.addBtn} onClick={handleAdd}>
          <IconPlus width="9" height="9" />
          <span className={styles.titleWrap}>
            <Text variant="nano" as="span" weight="bold">
              Dodaj dopłatę
            </Text>
          </span>
        </button>
      </div>

      {/* Rows */}
      <div className={styles.rows}>
        {surcharges.map((surcharge) => (
          <SurchargeRow
            key={surcharge.id}
            surcharge={surcharge}
            onChange={(updated) => updateSurcharge(surcharge.id, updated)}
            onDelete={() => deleteSurcharge(surcharge.id)}
          />
        ))}

        {newSurcharge && (
          <SurchargeRow
            surcharge={newSurcharge}
            onChange={setNewSurcharge}
            onDelete={handleCancelNew}
            isNew
            onConfirm={handleConfirmNew}
          />
        )}
      </div>
    </div>
  );
}
