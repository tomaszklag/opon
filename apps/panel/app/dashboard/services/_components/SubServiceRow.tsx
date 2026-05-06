'use client';

import { Text, NumberStepper } from '@opony/design-system-web';
import { IconTrash, IconLock, IconLockOutline, IconCheck } from '../../../../components/icons';
import type { SubServiceState } from '../_types';
import styles from './SubServiceRow.module.css';

interface Props {
  sub: SubServiceState;
  onChange: (updated: SubServiceState) => void;
  onDelete: () => void;
}

export function SubServiceRow({ sub, onChange, onDelete }: Props) {
  const isOverride = sub.pricePln !== null;

  function toggleIncluded() {
    if (sub.included) {
      onChange({ ...sub, included: false });
    } else {
      onChange({ ...sub, included: true });
    }
  }

  function toggleOverride() {
    if (isOverride) {
      // Switch back to inherit
      onChange({ ...sub, pricePln: null, durationMinutes: null });
    } else {
      // Switch to override
      onChange({ ...sub, pricePln: '', durationMinutes: '' });
    }
  }

  const rowClass = [
    styles.row,
    sub.included ? styles.included : '',
    sub.fromCatalog ? styles.fromCatalog : '',
    isOverride && !sub.included ? styles.overrideActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      {/* Drag handle */}
      <div className={styles.dragHandle} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Included checkbox */}
      <button
        className={`${styles.inclChk} ${sub.included ? styles.inclChkChecked : ''}`}
        onClick={toggleIncluded}
        aria-label={sub.included ? 'Wyłącz wliczanie' : 'Wlicz w cenę'}
        aria-pressed={sub.included}
      >
        {sub.included && <IconCheck width="8" height="8" style={{ color: 'var(--bg)' }} />}
      </button>

      {/* Name */}
      <div className={styles.nameWrap}>
        <div className={styles.name}>
          <Text variant="body-sm" as="span">
            {sub.name}
          </Text>
          {sub.fromCatalog && (
            <span className={`${styles.badge} ${styles.badgeTeal}`}>
              <Text variant="nano" as="span">
                z katalogu
              </Text>
            </span>
          )}
          {!sub.fromCatalog && (
            <span className={`${styles.badge} ${styles.badgeBlue}`}>
              <Text variant="nano" as="span">
                dodatek
              </Text>
            </span>
          )}
        </div>
        <Text variant="nano" as="span" color="secondary">
          {sub.included
            ? 'wliczone — klient nie dopłaca'
            : isOverride
              ? 'opcjonalne · własna cena i czas'
              : 'opcjonalne — cross-sell'}
        </Text>
      </div>

      {/* Price column */}
      {sub.included ? (
        <span className={styles.inclLabel}>
          <Text variant="nano" as="span" mono>
            wliczone
          </Text>
        </span>
      ) : isOverride ? (
        <NumberStepper
          value={sub.pricePln ?? ''}
          onChange={(v) => onChange({ ...sub, pricePln: v })}
          unit="zł"
          min={0}
          step={5}
          inputWidth={44}
          aria-label="Cena pod-usługi"
        />
      ) : (
        <div className={styles.inheritTag} title="Kliknij kłódkę aby ustawić własną cenę">
          <InheritIcon />
          <Text variant="nano" as="span" mono>
            jak usł.
          </Text>
        </div>
      )}

      {/* Duration column */}
      {sub.included && sub.durationMinutes === null ? (
        <div className={styles.inheritTag} title="Kliknij kłódkę aby ustawić własny czas">
          <InheritIcon />
          <Text variant="nano" as="span" mono>
            +0 min
          </Text>
        </div>
      ) : isOverride || (sub.included && sub.durationMinutes !== null) ? (
        <NumberStepper
          value={sub.durationMinutes ?? ''}
          onChange={(v) => onChange({ ...sub, durationMinutes: v })}
          unit="min"
          min={0}
          step={5}
          inputWidth={36}
          aria-label="Czas pod-usługi"
        />
      ) : (
        <div className={styles.inheritTag} title="Kliknij kłódkę aby ustawić własny czas">
          <InheritIcon />
          <Text variant="nano" as="span" mono>
            jak usł.
          </Text>
        </div>
      )}

      {/* Lock (override toggle) */}
      <button
        className={`${styles.overrideBtn} ${isOverride ? styles.overrideBtnActive : ''}`}
        onClick={toggleOverride}
        aria-label={isOverride ? 'Wróć do dziedziczenia z usługi' : 'Wymuś własną cenę i czas'}
        aria-pressed={isOverride}
      >
        {isOverride ? (
          <IconLockOutline width="10" height="10" />
        ) : (
          <IconLock width="10" height="10" />
        )}
      </button>

      {/* Delete */}
      <button className={styles.delBtn} onClick={onDelete} aria-label="Usuń pod-usługę">
        <IconTrash width="10" height="10" />
      </button>
    </div>
  );
}

function InheritIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
