'use client';
import React from 'react';
import styles from './ProviderCard.module.css';

export interface ProviderCardProps {
  name: string;
  initials?: string;
  photoUrl?: string;
  mobile?: boolean;
  distance?: string;
  rating?: number;
  ratingCount?: number;
  priceLabel?: string;
  price: string;
  currency?: string;
  priceFor?: string;
  nextSlot?: string;
  nextSlotUrgent?: boolean;
  favorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className={styles.ratingStars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" opacity={i < full ? 1 : 0.3}>
          <polygon
            points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2"
            fill="var(--accent)"
          />
        </svg>
      ))}
    </span>
  );
}

export function ProviderCard({
  name,
  initials,
  photoUrl,
  mobile,
  distance,
  rating,
  ratingCount,
  priceLabel = 'Cena od',
  price,
  currency = 'zł',
  priceFor,
  nextSlot,
  nextSlotUrgent,
  favorite,
  onFavoriteToggle,
  onClick,
  className,
}: ProviderCardProps) {
  const cls = [styles.card, className].filter(Boolean).join(' ');

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
      <header className={styles.head}>
        {photoUrl ? (
          <img className={styles.avatarPhoto} src={photoUrl} alt={name} />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {initials ?? name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className={styles.titleCol}>
          <div className={styles.name}>{name}</div>
          <div className={styles.metaRow}>
            {mobile && (
              <span className={styles.mobileTag}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 17h14M7 12l1.5-4.5A2 2 0 0 1 10.4 6h3.2a2 2 0 0 1 1.9 1.5L17 12" />
                  <path d="M5 12h14v5H5z" />
                  <circle cx="7.5" cy="17" r="1.5" fill="currentColor" />
                  <circle cx="16.5" cy="17" r="1.5" fill="currentColor" />
                </svg>
                Z dojazdem
              </span>
            )}
            {mobile && distance && <span className={styles.dotSep} aria-hidden="true" />}
            {distance && (
              <span className={styles.metaInline}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {distance}
              </span>
            )}
          </div>
        </div>
        {onFavoriteToggle && (
          <button
            type="button"
            className={[styles.heart, favorite ? styles.heartActive : null]
              .filter(Boolean)
              .join(' ')}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(e);
            }}
            aria-label={favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
          </button>
        )}
      </header>

      {rating !== undefined && (
        <div className={styles.rating}>
          <Stars rating={rating} />
          <span className={styles.ratingVal}>{rating.toFixed(1).replace('.', ',')}</span>
          {ratingCount !== undefined && (
            <span className={styles.ratingCount}>({ratingCount} opinii)</span>
          )}
        </div>
      )}

      <div className={styles.priceBlock}>
        <div>
          <div className={styles.overline}>{priceLabel}</div>
          <div className={styles.priceInline}>
            <span className={styles.priceValue}>{price}</span>
            <span className={styles.priceCurrency}>{currency}</span>
          </div>
          {priceFor && <div className={styles.priceFor}>{priceFor}</div>}
        </div>
        <div className={styles.priceArrow} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </div>
      </div>

      {nextSlot && (
        <div className={styles.slot}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={nextSlotUrgent ? 'var(--accent)' : 'var(--text-secondary)'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className={styles.slotLabel}>Najbliższy termin</span>
          <span
            className={[styles.slotVal, nextSlotUrgent ? styles.slotUrgent : null]
              .filter(Boolean)
              .join(' ')}
          >
            {nextSlot}
          </span>
        </div>
      )}
    </article>
  );
}
