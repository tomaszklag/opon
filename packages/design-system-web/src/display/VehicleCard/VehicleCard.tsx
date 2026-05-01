'use client';
import React from 'react';
import styles from './VehicleCard.module.css';

export interface VehicleCardProps {
  make: string;
  model: string;
  year?: number | string;
  tireSize: string;
  isDefault?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const CarIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export function VehicleCard({
  make,
  model,
  year,
  tireSize,
  isDefault,
  onEdit,
  onDelete,
  className,
}: VehicleCardProps) {
  return (
    <div
      className={[styles.card, isDefault ? styles.default : null, className]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[styles.icon, isDefault ? styles.iconDefault : null].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        <CarIcon />
      </span>
      <div className={styles.col}>
        <div className={styles.nameRow}>
          <span className={styles.name}>
            {make} {model}
          </span>
          {isDefault && <span className={styles.defaultBadge}>Domyślny</span>}
        </div>
        <div className={styles.tireRow}>
          <span className={styles.tire}>{tireSize}</span>
          {year && <span className={styles.meta}>{year}</span>}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className={styles.actions}>
          {onEdit && (
            <button
              type="button"
              className={styles.actBtn}
              onClick={onEdit}
              aria-label={`Edytuj ${make} ${model}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={[styles.actBtn, styles.actBtnDanger].join(' ')}
              onClick={onDelete}
              aria-label={`Usuń ${make} ${model}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
