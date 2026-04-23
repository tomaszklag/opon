'use client';
import React from 'react';
import styles from './AppHeader.module.css';

export interface AppHeaderProps {
  title?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function AppHeader({ title, leftSlot, rightSlot, className }: AppHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={styles.slot}>{leftSlot}</div>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={[styles.slot, styles.right].join(' ')}>{rightSlot}</div>
    </header>
  );
}
