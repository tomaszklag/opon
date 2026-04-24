import React from 'react';
import styles from './TicketCard.module.css';

export interface TicketRow {
  id: string;
  icon?: React.ReactNode;
  accentIcon?: boolean;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}

export interface TicketCardProps {
  code: string;
  rows: TicketRow[];
  onCopy?: () => void;
  className?: string;
}

export function TicketCard({ code, rows, onCopy, className }: TicketCardProps) {
  const [hyphen] = code.split('-');
  const rest = code.slice(hyphen?.length ?? 0);

  return (
    <div className={[styles.ticket, className].filter(Boolean).join(' ')}>
      {/* Top: booking code */}
      <div className={styles.top}>
        <div className={styles.codeCol}>
          <span className={styles.codeLabel}>Kod rezerwacji</span>
          <span className={styles.code} aria-label={`Kod rezerwacji: ${code}`}>
            <span>{hyphen}</span>
            <span className={styles.codeAccent}>{rest}</span>
          </span>
        </div>
        {onCopy && (
          <button
            type="button"
            className={styles.copyBtn}
            onClick={onCopy}
            aria-label="Skopiuj kod"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Kopiuj
          </button>
        )}
      </div>

      {/* Body rows */}
      <div className={styles.body}>
        {rows.map((row) => (
          <div key={row.id} className={styles.row}>
            {row.icon && (
              <span
                className={[styles.ico, row.accentIcon ? styles.icoAccent : null]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {row.icon}
              </span>
            )}
            <div className={styles.rowCol}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
              {row.sub && <span className={styles.rowSub}>{row.sub}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
