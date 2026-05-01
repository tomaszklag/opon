import React from 'react';
import styles from './PricingTable.module.css';

export interface PricingRow {
  id: string;
  size: string;
  price: string;
  highlighted?: boolean;
  highlightLabel?: string;
}

export interface PricingTableProps {
  rows: PricingRow[];
  surcharge?: { label: string; value: string };
  className?: string;
}

export function PricingTable({ rows, surcharge, className }: PricingTableProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <div className={styles.table}>
        {rows.map((row) => (
          <div
            key={row.id}
            className={[styles.row, row.highlighted ? styles.highlight : null]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.sizeCol}>
              <span className={styles.size}>{row.size}</span>
              {row.highlighted && row.highlightLabel && (
                <span className={styles.yourTag}>{row.highlightLabel}</span>
              )}
            </span>
            <span className={styles.price}>{row.price}</span>
          </div>
        ))}
      </div>
      {surcharge && (
        <div className={styles.surcharge}>
          <span>{surcharge.label}</span>
          <span className={styles.surchargeValue}>{surcharge.value}</span>
        </div>
      )}
    </div>
  );
}
