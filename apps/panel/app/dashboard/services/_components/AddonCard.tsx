'use client';

import { useEffect, useRef } from 'react';
import { Input, NumberStepper, Text } from '@opony/design-system-web';
import { IconPlusCircle } from '../../../../components/icons';
import { AccordionCard } from './AccordionCard';
import type { AddonState } from '../_types';
import styles from './AddonCard.module.css';

interface Props {
  addon: AddonState;
  onChange: (updated: AddonState) => void;
  onDelete: () => void;
  onToggle: () => void;
  defaultOpen?: boolean;
}

export function AddonCard({ addon, onChange, onDelete, onToggle, defaultOpen }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultOpen) inputRef.current?.focus();
  }, [defaultOpen]);

  const price = parseFloat(addon.pricePln) || null;
  const dur = addon.durationMinutes ? parseInt(addon.durationMinutes) || null : null;

  const meta =
    price !== null || dur !== null ? (
      <>
        {price !== null && (
          <Text variant="nano" as="span" mono color="secondary">
            {price} zł
          </Text>
        )}
        {dur !== null && (
          <Text variant="nano" as="span" mono color="secondary">
            {dur} min
          </Text>
        )}
      </>
    ) : undefined;

  return (
    <AccordionCard
      label={addon.name}
      emptyLabel="Bez nazwy"
      icon={<IconPlusCircle width="11" height="11" style={{ color: 'var(--accent)' }} />}
      meta={meta}
      enabled={addon.enabled}
      onToggle={onToggle}
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel={`Usuń ${addon.name || 'dodatek'}`}
    >
      <div className={styles.body}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Nazwa dodatku…"
          value={addon.name}
          onChange={(e) => onChange({ ...addon, name: e.target.value })}
          aria-label="Nazwa dodatku"
        />
        <div className={styles.steppers}>
          <NumberStepper
            value={addon.pricePln}
            onChange={(v) => onChange({ ...addon, pricePln: v })}
            unit="zł"
            min={0}
            step={5}
            inputWidth={60}
            aria-label="Cena w złotych"
          />
          <NumberStepper
            value={addon.durationMinutes ?? ''}
            onChange={(v) => onChange({ ...addon, durationMinutes: v || null })}
            unit="min"
            min={0}
            step={5}
            inputWidth={52}
            aria-label="Czas trwania (opcjonalny)"
          />
        </div>
      </div>
    </AccordionCard>
  );
}
