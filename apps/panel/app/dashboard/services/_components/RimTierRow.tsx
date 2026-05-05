'use client';

import { useState } from 'react';
import { Text, Input } from '@opony/design-system-web';
import { IconTrash, IconPlus, IconXClose } from '../../../../components/icons';
import type { RimTierState } from '../_types';
import styles from './RimTierRow.module.css';

interface Props {
  tier: RimTierState;
  onChange: (updated: RimTierState) => void;
  onDelete: () => void;
}

export function RimTierRow({ tier, onChange, onDelete }: Props) {
  const [addingSize, setAddingSize] = useState(false);
  const [newSize, setNewSize] = useState('');

  function removeRimSize(size: string) {
    onChange({ ...tier, rimSizes: tier.rimSizes.filter((s) => s !== size) });
  }

  function confirmAddSize() {
    const val = newSize.trim().toUpperCase();
    if (val && !tier.rimSizes.includes(val)) {
      onChange({ ...tier, rimSizes: [...tier.rimSizes, val] });
    }
    setNewSize('');
    setAddingSize(false);
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') confirmAddSize();
    if (e.key === 'Escape') {
      setNewSize('');
      setAddingSize(false);
    }
  }

  return (
    <div className={styles.row}>
      {/* Rim size chips */}
      <div className={styles.chips}>
        {tier.rimSizes.map((size) => (
          <span key={size} className={styles.chip}>
            <Text variant="nano" as="span" mono>
              {size}
            </Text>
            <button
              className={styles.chipX}
              onClick={() => removeRimSize(size)}
              aria-label={`Usuń ${size}`}
            >
              <IconXClose width="9" height="9" />
            </button>
          </span>
        ))}

        {addingSize ? (
          /* raw <input> — chip adder is 44px wide with text-transform:uppercase; DS Input doesn't fit */
          <input
            className={styles.addSizeInput}
            autoFocus
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={confirmAddSize}
            placeholder="R18"
            maxLength={4}
          />
        ) : (
          <button className={styles.chipAdd} onClick={() => setAddingSize(true)}>
            <IconPlus width="7" height="7" />
          </button>
        )}
      </div>

      {/* Price input */}
      <div className={styles.priceCell}>
        <input
          className={styles.priceCellInput}
          type="number"
          value={tier.pricePln}
          onChange={(e) => onChange({ ...tier, pricePln: e.target.value })}
          min="0"
          aria-label="Cena w złotych"
        />
        <span className={styles.priceCellUnit}>
          <Text variant="nano" as="span" color="accent" mono>
            zł
          </Text>
        </span>
      </div>

      {/* Duration input */}
      <div className={styles.durCell}>
        <input
          className={styles.durCellInput}
          type="number"
          value={tier.durationMinutes}
          onChange={(e) => onChange({ ...tier, durationMinutes: e.target.value })}
          min="0"
          aria-label="Czas trwania w minutach"
        />
        <span className={styles.durCellUnit}>
          <Text variant="nano" as="span" color="secondary" mono>
            min
          </Text>
        </span>
      </div>

      {/* Delete button */}
      <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń zakres">
        <IconTrash width="12" height="12" />
      </button>
    </div>
  );
}
