'use client';

import { useRef, useEffect } from 'react';
import { Input, NumberStepper } from '@opony/design-system-web';
import { IconTrash, IconCheck } from '../../../../components/icons';
import type { AddonState } from '../_types';
import styles from './AddonRow.module.css';

interface Props {
  addon: AddonState;
  onChange: (updated: AddonState) => void;
  onDelete: () => void;
  isNew?: boolean;
  onConfirm?: () => void;
}

export function AddonRow({ addon, onChange, onDelete, isNew, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) inputRef.current?.focus();
  }, [isNew]);

  const rowClass = [styles.row, isNew ? styles.newRow : ''].filter(Boolean).join(' ');

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && onConfirm && addon.name.trim()) onConfirm();
    if (e.key === 'Escape') onDelete();
  }

  return (
    <div className={rowClass}>
      {/* Name */}
      <div className={styles.info}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Nazwa dodatku…"
          value={addon.name}
          onChange={(e) => onChange({ ...addon, name: e.target.value })}
          onKeyDown={handleKeyDown}
          aria-label="Nazwa dodatku"
        />
      </div>

      {/* Price */}
      <NumberStepper
        value={addon.pricePln}
        onChange={(v) => onChange({ ...addon, pricePln: v })}
        unit="zł"
        min={0}
        step={5}
        inputWidth={52}
        aria-label="Cena w złotych"
      />

      {/* Duration (optional) */}
      <NumberStepper
        value={addon.durationMinutes ?? ''}
        onChange={(v) => onChange({ ...addon, durationMinutes: v || null })}
        unit="min"
        min={0}
        step={5}
        inputWidth={44}
        aria-label="Czas trwania (opcjonalny)"
      />

      {/* Delete / Confirm */}
      {isNew && onConfirm ? (
        <button
          className={styles.confirmBtn}
          onClick={onConfirm}
          disabled={!addon.name.trim()}
          aria-label="Potwierdź dodanie dodatku"
        >
          <IconCheck width="9" height="9" />
        </button>
      ) : (
        <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń dodatek">
          <IconTrash width="10" height="10" />
        </button>
      )}
    </div>
  );
}
