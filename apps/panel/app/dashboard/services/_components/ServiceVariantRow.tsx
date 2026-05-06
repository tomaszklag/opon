'use client';

import { useState, useRef } from 'react';
import { Toggle, Text } from '@opony/design-system-web';
import { IconChevronRight, IconPencil } from '../../../../components/icons';
import type { ServiceVariantState } from '../_types';
import styles from './ServiceVariantRow.module.css';

interface Props {
  variant: ServiceVariantState;
  isOpen: boolean;
  onToggle: () => void;
  onEnabledChange: (enabled: boolean) => void;
  onNameChange: (name: string) => void;
}

export function ServiceVariantRow({
  variant,
  isOpen,
  onToggle,
  onEnabledChange,
  onNameChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cancellingRef = useRef(false);

  const includedSubs = variant.subServices.filter((s) => s.included);
  const prices = variant.rimTiers.map((t) => parseFloat(t.pricePln) || 0).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const priceLabel =
    minPrice !== null
      ? minPrice === maxPrice
        ? `${minPrice} zł`
        : `${minPrice}–${maxPrice} zł`
      : '—';

  const firstTier = variant.rimTiers[0];
  const lastTier = variant.rimTiers[variant.rimTiers.length - 1];
  const rimMin =
    firstTier != null && firstTier.rimSizes.length > 0 ? (firstTier.rimSizes[0] ?? '') : null;
  const rimMax =
    lastTier != null && lastTier.rimSizes.length > 0
      ? (lastTier.rimSizes[lastTier.rimSizes.length - 1] ?? '')
      : null;

  const rimLabel = rimMin && rimMax ? (rimMin === rimMax ? rimMin : `${rimMin}–${rimMax}`) : null;
  const displayName = variant.name || rimLabel || 'Nowy wariant';
  const tiersLabel = variant.rimTiers.length
    ? `${variant.rimTiers.length} ${variant.rimTiers.length === 1 ? 'zakres' : 'zakresy'}`
    : 'brak konfiguracji';

  const rowClass = [styles.row, isOpen ? styles.open : '', !variant.enabled ? styles.disabled : '']
    .filter(Boolean)
    .join(' ');

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(variant.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function cancelEdit() {
    cancellingRef.current = true;
    setEditing(false);
  }

  function commitEdit() {
    if (cancellingRef.current) {
      cancellingRef.current = false;
      return;
    }
    const trimmed = draft.trim();
    if (trimmed !== variant.name) onNameChange(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  function handleRowClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('[data-toggle]') || target.closest('[data-name-edit]')) return;
    onToggle();
  }

  return (
    <div
      className={rowClass}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onToggle();
      }}
    >
      {/* Chevron */}
      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
        <IconChevronRight
          width="8"
          height="8"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </span>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          {editing ? (
            <input
              ref={inputRef}
              data-name-edit
              className={styles.nameInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              size={Math.max(draft.length || (rimLabel?.length ?? 8), 8)}
              placeholder={rimLabel ?? 'np. Osobowe'}
              aria-label="Nazwa wariantu (opcjonalna)"
            />
          ) : (
            <button
              data-name-edit
              className={styles.nameBtn}
              onClick={startEditing}
              aria-label={`Zmień nazwę: ${variant.name}`}
            >
              <Text variant="body-sm" as="span" weight="bold">
                {displayName}
              </Text>
              <IconPencil width="10" height="10" className={styles.editIcon} />
            </button>
          )}
          {includedSubs.length > 0 && (
            <span className={`${styles.badge} ${styles.badgeInc}`}>
              <Text variant="nano" as="span">
                ↳ {includedSubs.map((s) => s.name.toLowerCase().slice(0, 6)).join(' + ')}
              </Text>
            </span>
          )}
        </div>
        <div className={styles.meta}>
          {rimLabel && (
            <Text variant="nano" as="span" color="secondary">
              {rimLabel} · {tiersLabel}
            </Text>
          )}
          {!rimLabel && (
            <Text variant="nano" as="span" color="secondary">
              {tiersLabel}
            </Text>
          )}
          {variant.subServices.length > 0 && rimLabel && (
            <Text variant="nano" as="span" color="secondary">
              · {variant.subServices.filter((s) => s.included).length} wliczone ·{' '}
              {variant.subServices.filter((s) => !s.included).length} opcjonalne
            </Text>
          )}
        </div>
      </div>

      {/* Price */}
      <Text variant="nano" as="span" mono color="secondary" className={styles.price}>
        {priceLabel}
      </Text>

      {/* Toggle */}
      <span data-toggle>
        <Toggle
          size="sm"
          checked={variant.enabled}
          onChange={(e) => {
            e.stopPropagation();
            onEnabledChange(e.target.checked);
          }}
          aria-label={`${variant.enabled ? 'Wyłącz' : 'Włącz'} wariant ${variant.name}`}
        />
      </span>
    </div>
  );
}
