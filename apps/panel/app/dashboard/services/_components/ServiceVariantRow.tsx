'use client';

import { useRef, useEffect, useState } from 'react';
import { Input, NumberStepper, Text } from '@opony/design-system-web';
import { IconTrash, IconXClose } from '../../../../components/icons';
import type { ServiceVariantState } from '../_types';
import styles from './ServiceVariantRow.module.css';

interface Props {
  variant: ServiceVariantState;
  onChange: (updated: ServiceVariantState) => void;
  onDelete: () => void;
  autoFocusName?: boolean;
}

function derivedPrice(pricePln: string): string {
  const v = parseFloat(pricePln);
  if (!v) return '—';
  const per = Math.round((v / 4) * 100) / 100;
  return (Number.isInteger(per) ? String(per) : per.toFixed(2).replace('.', ',')) + ' zł';
}

function derivedDur(durationMinutes: string): string {
  const v = parseInt(durationMinutes, 10);
  if (!v) return '—';
  return Math.round(v / 4) + ' min';
}

export function ServiceVariantRow({ variant, onChange, onDelete, autoFocusName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasOverride = variant.pricePerWheelPln !== '' || variant.durationPerWheelMinutes !== '';
  const [wheelOpen, setWheelOpen] = useState(hasOverride);

  useEffect(() => {
    if (autoFocusName) inputRef.current?.focus();
  }, [autoFocusName]);

  function clearWheel() {
    onChange({ ...variant, pricePerWheelPln: '', durationPerWheelMinutes: '' });
    setWheelOpen(false);
  }

  return (
    <div className={styles.variantCard}>
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
          aria-label="Cena kompletu w złotych"
        />

        <NumberStepper
          value={variant.durationMinutes}
          onChange={(v) => onChange({ ...variant, durationMinutes: v })}
          unit="min"
          min={0}
          step={5}
          inputWidth={44}
          aria-label="Czas trwania kompletu"
        />

        <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń wariant">
          <IconTrash width="12" height="12" />
        </button>
      </div>

      {wheelOpen ? (
        <div className={styles.wheelRow}>
          <Text variant="nano" as="span" color="muted" className={styles.wheelLabel}>
            1 koło
          </Text>
          <NumberStepper
            value={variant.pricePerWheelPln}
            onChange={(v) => onChange({ ...variant, pricePerWheelPln: v })}
            unit="zł"
            min={0}
            step={1}
            inputWidth={56}
            aria-label="Cena za jedno koło"
          />
          {!variant.pricePerWheelPln && (
            <Text variant="nano" as="span" color="muted">
              = {derivedPrice(variant.pricePln)}
            </Text>
          )}
          <NumberStepper
            value={variant.durationPerWheelMinutes}
            onChange={(v) => onChange({ ...variant, durationPerWheelMinutes: v })}
            unit="min"
            min={0}
            step={1}
            inputWidth={44}
            aria-label="Czas za jedno koło"
          />
          {!variant.durationPerWheelMinutes && (
            <Text variant="nano" as="span" color="muted">
              = {derivedDur(variant.durationMinutes)}
            </Text>
          )}
          <button
            className={styles.clearWheelBtn}
            onClick={clearWheel}
            aria-label="Usuń nadpisanie"
          >
            <IconXClose width="9" height="9" />
          </button>
        </div>
      ) : (
        <button className={styles.addWheelBtn} onClick={() => setWheelOpen(true)}>
          + nadpisz cenę za 1 koło
          {(variant.pricePln || variant.durationMinutes) && (
            <span className={styles.addWheelHint}>
              ({derivedPrice(variant.pricePln)} · {derivedDur(variant.durationMinutes)})
            </span>
          )}
        </button>
      )}
    </div>
  );
}
