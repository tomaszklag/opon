'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, Text } from '@opony/design-system-web';
import { IconPlus, IconCheck } from '../../../../components/icons';
import type { ServicePricingType } from '../_types';
import styles from './NewServiceBlock.module.css';

const OPTIONS: { value: ServicePricingType; label: string; hint: string }[] = [
  {
    value: 'RIM_SIZES',
    label: 'Rozmiary felg',
    hint: 'Klient podaje R-kę → dopasuje tier cenowy. Idealna dla wymiany i wyważania.',
  },
  {
    value: 'VARIANTS',
    label: 'Warianty',
    hint: 'Wiele wariantów (np. Osobowe / SUV / Dostawcze), każdy z własną ceną i czasem.',
  },
  {
    value: 'FLAT',
    label: 'Stała cena',
    hint: 'Jedna cena niezależnie od pojazdu. Idealna dla prostych usług serwisowych.',
  },
];

interface Props {
  onCreate: (name: string, pricingType: ServicePricingType) => void;
  onCancel: () => void;
}

export function NewServiceBlock({ onCreate, onCancel }: Props) {
  const [name, setName] = useState('');
  const [pricingType, setPricingType] = useState<ServicePricingType>('RIM_SIZES');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && name.trim()) {
      onCreate(name.trim(), pricingType);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  const selectedOption = OPTIONS.find((o) => o.value === pricingType)!;

  return (
    <div className={styles.block}>
      {/* Header */}
      <div className={styles.header}>
        <IconPlus width="10" height="10" style={{ color: 'var(--accent)' }} />
        <Text variant="nano" as="span" weight="bold" color="accent" className={styles.label}>
          Nowa usługa
        </Text>
        <span className={styles.spacer} />
        <Text variant="nano" as="span" color="secondary" mono>
          ESC anuluj
        </Text>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Name input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Nazwa usługi…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Pricing type options */}
        <div className={styles.optionsWrap}>
          <Text variant="kicker-sm" as="span" className={styles.optionsLabel}>
            Charakter usługi
          </Text>
          <div className={styles.options}>
            {OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.opt} ${pricingType === opt.value ? styles.optSelected : ''}`}
              >
                <input
                  type="radio"
                  className={styles.radioHidden}
                  checked={pricingType === opt.value}
                  onChange={() => setPricingType(opt.value)}
                />
                <span
                  className={`${styles.optChk} ${pricingType === opt.value ? styles.optChkSelected : ''}`}
                >
                  {pricingType === opt.value && (
                    <IconCheck
                      width="8"
                      height="8"
                      style={{ stroke: 'var(--bg)', strokeWidth: 3 }}
                    />
                  )}
                </span>
                <span>
                  <Text variant="body-sm" as="span">
                    {opt.label}
                  </Text>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Contextual hint */}
        <div className={styles.hintRow}>
          <Text variant="nano" as="p" color="secondary">
            {selectedOption.hint}
          </Text>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => name.trim() && onCreate(name.trim(), pricingType)}
            disabled={!name.trim()}
          >
            <IconPlus width="10" height="10" />
            Utwórz usługę
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Anuluj
          </Button>
          <Text variant="nano" as="span" color="secondary" mono className={styles.enterHint}>
            Enter ↵ utwórz
          </Text>
        </div>
      </div>
    </div>
  );
}
