import React from 'react';
import styles from './RatingDistribution.module.css';

export interface RatingDistributionProps {
  counts: [number, number, number, number, number]; /* [5★, 4★, 3★, 2★, 1★] */
  className?: string;
}

export function RatingDistribution({ counts, className }: RatingDistributionProps) {
  const total = counts.reduce((s, n) => s + n, 0);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {counts.map((count, idx) => {
        const star = 5 - idx;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const prominent = pct >= 50;
        return (
          <div key={star} className={styles.row}>
            <span className={styles.star} aria-hidden="true">
              {star}★
            </span>
            <div
              className={styles.bar}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${star} gwiazdki — ${pct}%`}
            >
              <div
                className={[styles.fill, !prominent ? styles.low : null].filter(Boolean).join(' ')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className={[styles.pct, prominent ? styles.strong : null].filter(Boolean).join(' ')}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
