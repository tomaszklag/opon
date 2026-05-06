'use client';

import { useState, useRef, useEffect } from 'react';
import { Text, NumberStepper } from '@opony/design-system-web';
import { IconTrash, IconPlus, IconXClose } from '../../../../components/icons';
import { RIM_SIZES, type RimTierState } from '../_types';
import styles from './RimTierRow.module.css';

interface Props {
  tier: RimTierState;
  onChange: (updated: RimTierState) => void;
  onDelete: () => void;
}

export function RimTierRow({ tier, onChange, onDelete }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const available = RIM_SIZES.filter((s) => !tier.rimSizes.includes(s));

  useEffect(() => {
    if (!dropdownOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen]);

  function addSize(size: string) {
    onChange({ ...tier, rimSizes: [...tier.rimSizes, size] });
    if (available.length <= 1) setDropdownOpen(false);
  }

  function removeSize(size: string) {
    onChange({ ...tier, rimSizes: tier.rimSizes.filter((s) => s !== size) });
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
              onClick={() => removeSize(size)}
              aria-label={`Usuń ${size}`}
            >
              <IconXClose width="9" height="9" />
            </button>
          </span>
        ))}

        {available.length > 0 && (
          <div className={styles.addWrap} ref={wrapRef}>
            <button
              className={styles.chipAdd}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Dodaj rozmiar"
              aria-expanded={dropdownOpen}
            >
              <IconPlus width="7" height="7" />
            </button>

            {dropdownOpen && (
              <div className={styles.sizeDropdown} role="listbox" aria-label="Wybierz rozmiar">
                {available.map((size) => (
                  <button
                    key={size}
                    role="option"
                    aria-selected={false}
                    className={styles.sizeOption}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NumberStepper
        value={tier.pricePln}
        onChange={(v) => onChange({ ...tier, pricePln: v })}
        unit="zł"
        min={0}
        step={5}
        inputWidth={56}
        aria-label="Cena w złotych"
      />

      <NumberStepper
        value={tier.durationMinutes}
        onChange={(v) => onChange({ ...tier, durationMinutes: v })}
        unit="min"
        min={0}
        step={5}
        inputWidth={44}
        aria-label="Czas trwania w minutach"
      />

      <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń zakres">
        <IconTrash width="12" height="12" />
      </button>
    </div>
  );
}
