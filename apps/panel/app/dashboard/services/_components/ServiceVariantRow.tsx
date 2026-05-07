'use client';

import { useRef, useEffect } from 'react';
import { Input, NumberStepper } from '@opony/design-system-web';
import { IconTrash } from '../../../../components/icons';
import type { ServiceVariantState } from '../_types';
import styles from './ServiceVariantRow.module.css';

interface Props {
  variant: ServiceVariantState;
  onChange: (updated: ServiceVariantState) => void;
  onDelete: () => void;
  autoFocusName?: boolean;
}

export function ServiceVariantRow({ variant, onChange, onDelete, autoFocusName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusName) inputRef.current?.focus();
  }, [autoFocusName]);

  return (
    <div className={styles.variantRow}>
      <div className={styles.nameWrap}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Nazwa wariantu…"
          value={variant.name ?? ''}
          onChange={(e) => onChange({ ...variant, name: e.target.value || null })}
          aria-label="Nazwa wariantu"
        />
      </div>

      <NumberStepper
        value={variant.pricePln}
        onChange={(v) => onChange({ ...variant, pricePln: v })}
        unit="zł"
        min={0}
        step={5}
        inputWidth={56}
        aria-label="Cena w złotych"
      />

      <NumberStepper
        value={variant.durationMinutes}
        onChange={(v) => onChange({ ...variant, durationMinutes: v })}
        unit="min"
        min={0}
        step={5}
        inputWidth={44}
        aria-label="Czas trwania"
      />

      <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń wariant">
        <IconTrash width="12" height="12" />
      </button>
    </div>
  );
}
