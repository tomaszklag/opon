'use client';
import React, { useRef } from 'react';
import styles from './SearchInput.module.css';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  onClear?: () => void;
  className?: string;
}

export function SearchInput({ value, onClear, className, ...props }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.focus()}
    >
      <svg
        className={styles.searchIcon}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input ref={inputRef} type="search" value={value} className={styles.input} {...props} />
      {value && onClear && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          aria-label="Wyczyść wyszukiwanie"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
