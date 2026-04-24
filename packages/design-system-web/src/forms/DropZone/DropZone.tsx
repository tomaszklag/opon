'use client';
import React, { useRef, useState } from 'react';
import styles from './DropZone.module.css';

export interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  required?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

export function DropZone({
  onFiles,
  accept,
  maxFiles,
  required,
  label,
  hint,
  className,
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, maxFiles);
    onFiles(files);
  }

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </span>
      )}
      <div
        className={[styles.zone, dragging ? styles.dragging : null].filter(Boolean).join(' ')}
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Upuść pliki lub kliknij'}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <svg
          className={styles.icon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className={styles.cta}>
          <strong>Upuść lub kliknij</strong>
          {maxFiles && <span className={styles.sub}> — maks. {maxFiles} pliki</span>}
        </span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!maxFiles || maxFiles > 1}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
