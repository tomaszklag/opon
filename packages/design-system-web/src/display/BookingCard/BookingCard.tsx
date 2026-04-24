'use client';
import React from 'react';
import styles from './BookingCard.module.css';

export type BookingCardStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface BookingCardProps {
  status: BookingCardStatus;
  providerName: string;
  providerAddress?: string;
  mobile?: boolean;
  providerInitials?: string;
  datetime: string;
  duration?: string;
  price: string;
  paid?: boolean;
  urgentLabel?: string;
  onClick?: () => void;
  className?: string;
}

const STATUS_LABEL: Record<BookingCardStatus, string> = {
  CONFIRMED: 'Potwierdzona',
  PENDING: 'Oczekuje',
  COMPLETED: 'Zrealizowana',
  CANCELLED: 'Anulowana',
};

export function BookingCard({
  status,
  providerName,
  providerAddress,
  mobile,
  providerInitials,
  datetime,
  duration,
  price,
  paid,
  urgentLabel,
  onClick,
  className,
}: BookingCardProps) {
  const cls = [styles.card, className].filter(Boolean).join(' ');
  const stripCls = [styles.strip, styles[`strip${status}`]].filter(Boolean).join(' ');
  const pillCls = [styles.pill, styles[`pill${status}`]].filter(Boolean).join(' ');

  return (
    <article
      className={cls}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {/* Status strip */}
      <div className={stripCls}>
        <span className={pillCls}>{STATUS_LABEL[status]}</span>
        {urgentLabel && (
          <span
            className={[
              styles.urgentChip,
              status === 'CONFIRMED' ? styles.urgentAccent : styles.urgentMuted,
            ].join(' ')}
          >
            {urgentLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.headerRow}>
          {providerInitials ? (
            <span className={styles.avatarMono} aria-hidden="true">
              {providerInitials}
            </span>
          ) : (
            <span className={styles.avatarPlaceholder} aria-hidden="true" />
          )}
          <div className={styles.titleCol}>
            <span className={styles.name}>{providerName}</span>
            {providerAddress && (
              <div className={styles.addr}>
                {mobile && <span className={styles.mobileMini}>Mobilny</span>}
                <span>{providerAddress}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.time}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {datetime}
          </span>
          {duration && <span className={styles.duration}>{duration}</span>}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.priceCol}>
          <span className={styles.priceAmount}>{price}</span>
          {paid !== undefined && (
            <span
              className={[styles.payStatus, paid ? styles.paid : null].filter(Boolean).join(' ')}
            >
              {paid ? '✓ Zapłacono' : 'Do zapłaty'}
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={styles.chevron}
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </article>
  );
}
