'use client';

import { Toggle, Text } from '@opony/design-system-web';
import { IconTrash, IconChevronDown, IconCheck } from '../../../../components/icons';
import type { SurchargeState } from '../_types';
import styles from './SurchargeRow.module.css';

interface Props {
  surcharge: SurchargeState;
  onChange: (updated: SurchargeState) => void;
  onDelete: () => void;
  isNew?: boolean;
  onConfirm?: () => void;
}

export function SurchargeRow({ surcharge, onChange, onDelete, isNew, onConfirm }: Props) {
  const price = parseFloat(surcharge.pricePln) || 0;
  const multiplier = surcharge.scope === 'PER_WHEEL' ? 4 : 4;
  const calcLabel = surcharge.enabled ? `= +${price * multiplier} zł` : 'off';

  function toggleScope() {
    onChange({
      ...surcharge,
      scope: surcharge.scope === 'PER_WHEEL' ? 'PER_SENSOR' : 'PER_WHEEL',
    });
  }

  const rowClass = [styles.row, !surcharge.enabled ? styles.off : '', isNew ? styles.newRow : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      {/* Toggle */}
      <span>
        <Toggle
          size="sm"
          checked={surcharge.enabled}
          onChange={(e) => onChange({ ...surcharge, enabled: e.target.checked })}
          aria-label={`${surcharge.enabled ? 'Wyłącz' : 'Włącz'} dopłatę ${surcharge.name}`}
        />
      </span>

      {/* Icon placeholder */}
      <div className={styles.icon}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--purple)"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      {/* Name / description */}
      <div className={styles.info}>
        {isNew ? (
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Nazwa dopłaty…"
            value={surcharge.name}
            onChange={(e) => onChange({ ...surcharge, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onConfirm) onConfirm();
              if (e.key === 'Escape') onDelete();
            }}
            autoFocus
          />
        ) : (
          <>
            <Text variant="body-sm" as="span">
              {surcharge.name}
            </Text>
            <Text variant="nano" as="span" color="secondary">
              {surcharge.scope === 'PER_WHEEL'
                ? 'per koło · ×4 przy wymianach'
                : 'reset czujników ciśnienia'}
            </Text>
          </>
        )}
      </div>

      {/* Scope selector */}
      <button className={styles.scope} onClick={toggleScope}>
        <Text variant="nano" as="span" mono>
          {surcharge.scope === 'PER_WHEEL' ? 'per koło' : 'per sensor'}
        </Text>
        <IconChevronDown width="7" height="7" />
      </button>

      {/* Price input */}
      <div className={styles.priceCell}>
        <input
          className={styles.priceInput}
          type="number"
          value={surcharge.pricePln}
          onChange={(e) => onChange({ ...surcharge, pricePln: e.target.value })}
          min="0"
          placeholder="0"
          aria-label="Kwota dopłaty"
        />
        <span className={styles.priceUnit}>
          <Text variant="nano" as="span" mono>
            +zł
          </Text>
        </span>
      </div>

      {/* Auto-calc */}
      <Text
        variant="nano"
        as="span"
        mono
        className={styles.calc}
        style={{ color: surcharge.enabled ? 'var(--purple)' : 'var(--text-muted)' }}
      >
        {calcLabel}
      </Text>

      {/* Delete / Confirm button */}
      {isNew && onConfirm ? (
        <button
          className={styles.confirmBtn}
          onClick={onConfirm}
          aria-label="Potwierdź dodanie dopłaty"
        >
          <IconCheck width="9" height="9" />
        </button>
      ) : (
        <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń dopłatę">
          <IconTrash width="10" height="10" />
        </button>
      )}
    </div>
  );
}
