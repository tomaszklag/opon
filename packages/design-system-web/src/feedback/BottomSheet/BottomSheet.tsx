'use client';
import React, { useEffect, useRef } from 'react';
import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      prevFocusRef.current?.focus();
      prevFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={[styles.dialog, className].filter(Boolean).join(' ')}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Zamknij"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </dialog>
  );
}
