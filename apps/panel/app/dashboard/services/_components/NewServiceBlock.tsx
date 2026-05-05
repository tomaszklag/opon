'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, Text } from '@opony/design-system-web';
import { IconPlus, IconXClose } from '../../../../components/icons';
import type { PricingMode } from '../_types';
import styles from './NewServiceBlock.module.css';

interface Props {
  onCreate: (name: string, pricingMode: PricingMode) => void;
  onCancel: () => void;
}

export function NewServiceBlock({ onCreate, onCancel }: Props) {
  const [name, setName] = useState('');
  const [pricingMode, setPricingMode] = useState<PricingMode>('PER_SET');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && name.trim()) {
      onCreate(name.trim(), pricingMode);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  const hintText =
    pricingMode === 'PER_SET'
      ? 'Po zapisaniu pojawi się pusty accordion, gdzie dodasz zakresy R-ek i warianty pojazdu (Osobowe, SUV…).'
      : 'Jedna cena niezależnie od rozmiaru felgi — idealna dla usług serwisowych bez znaczenia na R.';

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

        {/* Pricing mode options */}
        <div className={styles.optionsWrap}>
          <Text variant="nano" as="span" weight="bold" className={styles.optionsLabel}>
            Charakter usługi
          </Text>
          <div className={styles.options}>
            <label
              className={`${styles.opt} ${pricingMode === 'PER_SET' ? styles.optSelected : ''}`}
            >
              <input
                type="radio"
                className={styles.radioHidden}
                checked={pricingMode === 'PER_SET'}
                onChange={() => setPricingMode('PER_SET')}
              />
              <span
                className={`${styles.optChk} ${pricingMode === 'PER_SET' ? styles.optChkSelected : ''}`}
              >
                {pricingMode === 'PER_SET' && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bg)"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span>
                <Text variant="nano" as="span" weight="bold">
                  Wymaga rozmiaru felgi
                </Text>
                <Text variant="nano" as="div" color="secondary">
                  klient poda R-kę → dopasuje tier cenowy
                </Text>
              </span>
            </label>
            <label
              className={`${styles.opt} ${pricingMode === 'PER_WHEEL' ? styles.optSelected : ''}`}
            >
              <input
                type="radio"
                className={styles.radioHidden}
                checked={pricingMode === 'PER_WHEEL'}
                onChange={() => setPricingMode('PER_WHEEL')}
              />
              <span
                className={`${styles.optChk} ${pricingMode === 'PER_WHEEL' ? styles.optChkSelected : ''}`}
              >
                {pricingMode === 'PER_WHEEL' && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--bg)"
                    strokeWidth="3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span>
                <Text variant="nano" as="span" weight="bold">
                  Cena stała (flat)
                </Text>
                <Text variant="nano" as="div" color="secondary">
                  jedna cena niezależnie od rozmiaru
                </Text>
              </span>
            </label>
          </div>
        </div>

        {/* Contextual hint */}
        <div className={styles.hintRow}>
          <Text variant="nano" as="p" color="secondary">
            <strong>{pricingMode === 'PER_SET' ? 'Wymaga rozmiaru felgi' : 'Cena stała'}</strong> —{' '}
            {hintText}
          </Text>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => name.trim() && onCreate(name.trim(), pricingMode)}
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
