'use client';
import React, { useId, useState } from 'react';
import styles from './StarRating.module.css';

export interface StarRatingProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StarIcon = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled || half ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {half ? (
      <>
        <defs>
          <clipPath id="half-clip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="none"
          stroke="currentColor"
        />
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          clipPath="url(#half-clip)"
        />
      </>
    ) : (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    )}
  </svg>
);

export function StarRating({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const uid = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = Boolean(onChange) && !readOnly;
  const displayValue = hovered ?? value;

  return (
    <div
      className={[styles.root, styles[size], interactive ? styles.interactive : null, className]
        .filter(Boolean)
        .join(' ')}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating' : undefined}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = displayValue >= starValue;

        if (interactive) {
          return (
            <label
              key={i}
              className={[styles.star, filled ? styles.filled : null].filter(Boolean).join(' ')}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
            >
              <input
                type="radio"
                name={uid}
                value={starValue}
                checked={value === starValue}
                onChange={() => onChange?.(starValue)}
                className={styles.input}
                aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              />
              <StarIcon filled={filled} />
            </label>
          );
        }

        return (
          <span
            key={i}
            className={[styles.star, filled ? styles.filled : null].filter(Boolean).join(' ')}
            aria-hidden="true"
          >
            <StarIcon filled={filled} />
          </span>
        );
      })}
      {!interactive && (
        <span className={styles.srOnly}>
          {value} out of {max} stars
        </span>
      )}
    </div>
  );
}
