'use client';

import { useState, useRef, useEffect } from 'react';
import { Text, NumberStepper } from '@opony/design-system-web';
import { IconTrash, IconPlus, IconXClose } from '../../../../components/icons';
import { RIM_SIZES, type ServiceVariantState } from '../_types';
import styles from './RimTierRow.module.css';

interface Props {
  tier: ServiceVariantState;
  onChange: (updated: ServiceVariantState) => void;
  onDelete: () => void;
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

export function RimTierRow({ tier, onChange, onDelete }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hasOverride = tier.pricePerWheelPln !== '' || tier.durationPerWheelMinutes !== '';
  const [wheelOpen, setWheelOpen] = useState(hasOverride);

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
    const next = [...tier.rimSizes, size];
    onChange({ ...tier, rimSizes: next });
    if (next.length === RIM_SIZES.length) setDropdownOpen(false);
  }

  function removeSize(size: string) {
    onChange({ ...tier, rimSizes: tier.rimSizes.filter((s) => s !== size) });
  }

  function clearWheel() {
    onChange({ ...tier, pricePerWheelPln: '', durationPerWheelMinutes: '' });
    setWheelOpen(false);
  }

  return (
    <div className={styles.card}>
      <div className={styles.mainRow}>
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
                      <Text variant="nano" as="span" mono weight="bold">
                        {size}
                      </Text>
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
          aria-label="Cena kompletu w złotych"
        />

        <NumberStepper
          value={tier.durationMinutes}
          onChange={(v) => onChange({ ...tier, durationMinutes: v })}
          unit="min"
          min={0}
          step={5}
          inputWidth={44}
          aria-label="Czas trwania kompletu w minutach"
        />

        <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń zakres">
          <IconTrash width="12" height="12" />
        </button>
      </div>

      {wheelOpen ? (
        <div className={styles.wheelRow}>
          <Text variant="nano" as="span" color="muted" className={styles.wheelLabel}>
            1 koło
          </Text>
          <NumberStepper
            value={tier.pricePerWheelPln}
            onChange={(v) => onChange({ ...tier, pricePerWheelPln: v })}
            unit="zł"
            min={0}
            step={1}
            inputWidth={56}
            aria-label="Cena za jedno koło"
          />
          {!tier.pricePerWheelPln && (
            <Text variant="nano" as="span" color="muted">
              = {derivedPrice(tier.pricePln)}
            </Text>
          )}
          <NumberStepper
            value={tier.durationPerWheelMinutes}
            onChange={(v) => onChange({ ...tier, durationPerWheelMinutes: v })}
            unit="min"
            min={0}
            step={1}
            inputWidth={44}
            aria-label="Czas za jedno koło"
          />
          {!tier.durationPerWheelMinutes && (
            <Text variant="nano" as="span" color="muted">
              = {derivedDur(tier.durationMinutes)}
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
          {(tier.pricePln || tier.durationMinutes) && (
            <span className={styles.addWheelHint}>
              ({derivedPrice(tier.pricePln)} · {derivedDur(tier.durationMinutes)})
            </span>
          )}
        </button>
      )}
    </div>
  );
}
