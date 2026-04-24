'use client';
import React from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  className?: string;
}

function getRange(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function getPages(page: number, total: number, siblings = 1): (number | '…')[] {
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);

  const pages: (number | '…')[] = [1];
  if (left > 2) pages.push('…');
  pages.push(...getRange(left, right));
  if (right < total - 1) pages.push('…');
  if (total > 1) pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblings = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPages(page, totalPages, siblings);

  return (
    <nav className={[styles.nav, className].filter(Boolean).join(' ')} aria-label="Paginacja">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Poprzednia strona"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={[styles.page, p === page ? styles.active : null].filter(Boolean).join(' ')}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Strona ${p}`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={styles.arrow}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Następna strona"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
